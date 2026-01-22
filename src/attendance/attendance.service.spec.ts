import { AppBadRequestException } from '../exceptions';

jest.mock('../models/attendance', () => {
  class AttendanceMock {
    constructor(data: any) {
      Object.assign(this, data);
    }
    static fromFirestore = jest.fn();
  }
  return { Attendance: AttendanceMock };
});

jest.mock('../models/base.model', () => ({
  BaseModel: {
    toFirestore: (v: any) => v,
  },
}));

describe('AttendanceService (unit)', () => {
  let service: any;
  let Attendance: any;

  function makeMockFirestore(overrides: any = {}) {
    const docRef = { id: 'doc1' } as any;

    const collection = {
      doc: () => docRef,
      where: () => collection,
      orderBy: () => collection,
      limit: () => collection,
      get: async () => ({ empty: true, docs: [] }),
    } as any;

    const firestore: any = {
      collection: () => collection,
      runTransaction: async (cb: any) => {
        const t = {
          get: async () => ({ exists: true, id: docRef.id }),
          set: jest.fn(),
          update: jest.fn(),
        };
        return cb(t);
      },
    };

    Object.assign(firestore, overrides);
    return firestore;
  }

  beforeEach(() => {
    jest.restoreAllMocks();
  });

  it('doCheckin: sucesso - retorna Attendance.fromFirestore', async () => {
    const mockFirestore = makeMockFirestore();

    Attendance = require('../models/attendance').Attendance;
    const fakeResult = { id: 'saved' };
    Attendance.fromFirestore.mockImplementation(() => fakeResult);

    const mod = require('./attendance.service');
    service = new mod.AttendanceService(mockFirestore as any);

    const dto: any = { childId: 'child1', companyId: 'c1' };
    const res = await service.doCheckin(dto);

    expect(res).toBe(fakeResult);
  });

  it('doCheckout: quando nao existe sessao aberta deve lançar BadRequest', async () => {
    const openQuery: any = {
      where: () => openQuery,
      orderBy: () => openQuery,
      limit: () => openQuery,
      get: async () => ({ empty: true }),
    };

    const collection = {
      doc: () => ({}),
      where: () => openQuery,
      orderBy: () => openQuery,
      limit: () => openQuery,
    } as any;

    const mockFirestore = {
      collection: () => collection,
    } as any;

    const mod = require('./attendance.service');
    service = new mod.AttendanceService(mockFirestore as any);

    await expect(service.doCheckout({ childId: 'missing-open' } as any)).rejects.toBeInstanceOf(AppBadRequestException);
  });
});
