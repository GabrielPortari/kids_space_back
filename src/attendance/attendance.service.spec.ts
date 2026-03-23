import { BadRequestException } from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { AttendanceEntity } from './entities/attendance.entity';
import { ChildEntity } from '../child/entities/child.entity';
import { ParentEntity } from '../parent/entities/parent.entity';
import * as admin from 'firebase-admin';

describe('AttendanceService', () => {
  let service: AttendanceService;
  let firestoreMock: any;
  let txMock: any;

  const childRef = { kind: 'childRef', id: 'child-1' } as any;
  const attendanceRef = {
    kind: 'attendanceRef',
    id: 'att-1',
    get: jest.fn(),
  } as any;
  const parentRef = { kind: 'parentRef', id: 'parent-1' } as any;
  const lockRef = { kind: 'lockRef', id: 'company-1__child-1' } as any;
  const legacyQueryRef = { kind: 'legacyActiveQuery' } as any;

  function doc(id: string, data: any, exists = true) {
    return {
      id,
      exists,
      data: () => data,
    } as any;
  }

  function makeTxGet(overrides: Record<string, any> = {}) {
    return jest.fn(async (refOrQuery: any) => {
      if (refOrQuery === childRef) {
        return (
          overrides.childDoc ??
          doc('child-1', { companyId: 'company-1', parents: ['parent-1'] })
        );
      }

      if (refOrQuery === lockRef) {
        return overrides.lockDoc ?? doc(lockRef.id, {}, false);
      }

      if (refOrQuery === legacyQueryRef) {
        return overrides.legacySnapshot ?? { docs: [] };
      }

      if (refOrQuery?.kind === 'attendanceRef') {
        return (
          overrides.attendanceDoc ??
          doc(refOrQuery.id || 'att-1', {
            companyId: 'company-1',
            childId: 'child-1',
            checkInTime: new Date(Date.now() - 60_000),
            checkOutTime: undefined,
            notes: 'open',
          })
        );
      }

      if (refOrQuery === parentRef) {
        return (
          overrides.parentDoc ??
          doc('parent-1', { document: '123.456.789-00' }, true)
        );
      }

      return doc('unknown', {}, false);
    });
  }

  function setupFirestoreTx(overrides: Record<string, any> = {}) {
    txMock = {
      get: makeTxGet(overrides),
      set: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    firestoreMock = {
      runTransaction: jest.fn(async (handler: any) => handler(txMock)),
      collection: jest.fn(() => ({
        doc: jest.fn(() => lockRef),
      })),
    };

    jest.spyOn(admin, 'firestore').mockReturnValue(firestoreMock);
    (admin.firestore as any).FieldValue = {
      serverTimestamp: jest.fn(() => '__server_timestamp__'),
    };
  }

  beforeEach(async () => {
    jest.restoreAllMocks();
    service = new AttendanceService();

    setupFirestoreTx();

    jest.spyOn(ChildEntity, 'docRef').mockImplementation(() => childRef);
    jest.spyOn(ParentEntity, 'docRef').mockImplementation(() => parentRef);
    jest.spyOn(AttendanceEntity, 'docRef').mockImplementation((id?: string) => {
      if (id) {
        return { ...attendanceRef, id } as any;
      }
      return attendanceRef;
    });
    jest
      .spyOn(AttendanceEntity, 'toFirestore')
      .mockImplementation((value: any) => value);
    jest
      .spyOn(AttendanceEntity, 'fromFirestore')
      .mockImplementation((snapshot: any) => ({
        id: snapshot.id,
        ...(snapshot.data ? snapshot.data() : {}),
      }));
    jest.spyOn(AttendanceEntity, 'collectionRef').mockReturnValue({
      where: jest.fn(() => ({
        where: jest.fn(() => ({
          orderBy: jest.fn(() => legacyQueryRef),
        })),
      })),
    } as any);
    jest
      .spyOn(AttendanceEntity, 'fromFirestoreList')
      .mockImplementation((docs: any[]) =>
        docs.map((item) => ({
          id: item.id,
          ...(item.data ? item.data() : {}),
        })),
      );

    attendanceRef.get.mockResolvedValue(
      doc('att-1', {
        companyId: 'company-1',
        childId: 'child-1',
        attendanceType: 'checkin',
      }),
    );
  });

  it('creates check-in and persists attendance + active lock', async () => {
    const result = await service.checkIn(
      {
        childId: 'child-1',
        responsibleIdWhoCheckedInId: 'parent-1',
        notes: '  entrada  ',
      },
      'company-1',
      'collab-1',
      ['collaborator'],
    );

    expect(firestoreMock.runTransaction).toHaveBeenCalledTimes(1);
    expect(txMock.set).toHaveBeenCalledTimes(2);
    expect(txMock.set).toHaveBeenNthCalledWith(
      1,
      attendanceRef,
      expect.objectContaining({
        companyId: 'company-1',
        childId: 'child-1',
        collaboratorWhoCheckedInId: 'collab-1',
        responsibleIdWhoCheckedInId: 'parent-1',
        attendanceType: 'checkin',
        notes: 'entrada',
      }),
    );
    expect(txMock.set).toHaveBeenNthCalledWith(
      2,
      lockRef,
      expect.objectContaining({
        attendanceId: 'att-1',
        companyId: 'company-1',
        childId: 'child-1',
      }),
    );
    expect(result).toEqual(
      expect.objectContaining({
        id: 'att-1',
        companyId: 'company-1',
        childId: 'child-1',
      }),
    );
  });

  it('blocks check-in when child already has active session lock', async () => {
    setupFirestoreTx({
      lockDoc: doc(lockRef.id, { attendanceId: 'att-open' }, true),
    });

    try {
      await service.checkIn({ childId: 'child-1' }, 'company-1', 'collab-1', [
        'collaborator',
      ]);
      fail('Expected BadRequestException');
    } catch (error) {
      expect(error).toBeInstanceOf(BadRequestException);
      expect((error as Error).message).toContain(
        'Child already has an active check-in',
      );
    }
  });

  it('checks out with CPF confirmation and persists update + lock removal', async () => {
    setupFirestoreTx({
      lockDoc: doc(lockRef.id, { attendanceId: 'att-1' }, true),
      attendanceDoc: doc('att-1', {
        companyId: 'company-1',
        childId: 'child-1',
        checkInTime: new Date(Date.now() - 3 * 60_000),
        checkOutTime: undefined,
        notes: 'aberto',
      }),
      parentDoc: doc('parent-1', { document: '123.456.789-00' }, true),
    });

    attendanceRef.get.mockResolvedValue(
      doc('att-1', {
        companyId: 'company-1',
        childId: 'child-1',
        attendanceType: 'checkout',
      }),
    );

    const result = await service.checkOut(
      {
        childId: 'child-1',
        responsibleDocument: '12345678900',
        notes: '  saiu  ',
      },
      'company-1',
      'collab-2',
      ['collaborator'],
    );

    expect(txMock.update).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'att-1' }),
      expect.objectContaining({
        attendanceType: 'checkout',
        collaboratorWhoCheckedOutId: 'collab-2',
        responsibleIdWhoCheckedOutId: 'parent-1',
        notes: 'saiu',
      }),
    );
    expect(txMock.delete).toHaveBeenCalledWith(lockRef);
    expect(result).toEqual(
      expect.objectContaining({
        id: 'att-1',
        companyId: 'company-1',
        childId: 'child-1',
      }),
    );
  });

  it('rejects checkout when responsible CPF does not match child responsibles', async () => {
    setupFirestoreTx({
      lockDoc: doc(lockRef.id, { attendanceId: 'att-1' }, true),
      attendanceDoc: doc('att-1', {
        companyId: 'company-1',
        childId: 'child-1',
        checkInTime: new Date(Date.now() - 60_000),
      }),
      parentDoc: doc('parent-1', { document: '99999999999' }, true),
    });

    try {
      await service.checkOut(
        {
          childId: 'child-1',
          responsibleDocument: '12345678900',
        },
        'company-1',
        'collab-2',
        ['collaborator'],
      );
      fail('Expected BadRequestException');
    } catch (error) {
      expect(error).toBeInstanceOf(BadRequestException);
      expect((error as Error).message).toContain(
        'Responsible CPF does not match child records',
      );
    }
  });
});
