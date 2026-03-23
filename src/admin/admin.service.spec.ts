import { BadRequestException, NotFoundException } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminEntity } from './entities/admin.entity';
import * as admin from 'firebase-admin';

describe('AdminService', () => {
  let service: AdminService;

  const adminRef = {
    kind: 'adminRef',
    id: 'admin-1',
    get: jest.fn(),
    set: jest.fn().mockResolvedValue({}),
    update: jest.fn().mockResolvedValue({}),
    delete: jest.fn().mockResolvedValue({}),
  } as any;

  function doc(id: string, data: any, exists = true) {
    return {
      id,
      exists,
      data: () => data,
    } as any;
  }

  beforeEach(() => {
    jest.restoreAllMocks();
    service = new AdminService();

    const collectionMock = {
      orderBy: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      get: jest.fn().mockResolvedValue({ docs: [] }),
      doc: jest.fn((id?: string) => ({
        ...adminRef,
        id: id || 'admin-1',
      })),
    };

    const firestoreMock = {
      collection: jest.fn(() => collectionMock),
    };

    jest.spyOn(admin, 'firestore').mockReturnValue(firestoreMock as any);
    (admin.firestore as any).FieldValue = {
      serverTimestamp: jest.fn(() => '__server_timestamp__'),
    };

    jest.spyOn(AdminEntity, 'docRef').mockImplementation((id?: string) => {
      if (id) {
        return { ...adminRef, id } as any;
      }
      return adminRef;
    });

    jest.spyOn(AdminEntity, 'toFirestore').mockImplementation((value: any) => {
      const data = { ...value };
      delete data.id;
      return data;
    });

    jest
      .spyOn(AdminEntity, 'fromFirestore')
      .mockImplementation((snapshot: any) => ({
        id: snapshot.id,
        ...(snapshot.data ? snapshot.data() : {}),
      }));

    jest.spyOn(AdminEntity, 'collectionRef').mockReturnValue({
      orderBy: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      get: jest.fn().mockResolvedValue({ docs: [] }),
    } as any);

    jest
      .spyOn(AdminEntity, 'fromFirestoreList')
      .mockImplementation((docs: any[]) =>
        docs.map((item) => ({
          id: item.id,
          ...(item.data ? item.data() : {}),
        })),
      );
  });

  it('creates and normalizes admin data', async () => {
    adminRef.get.mockResolvedValue(
      doc('admin-1', {
        name: 'John Doe',
        email: 'JOHN@EXAMPLE.COM',
        document: '12345678900',
        active: true,
      }),
    );

    const result = await service.create({
      name: '  John Doe  ',
      email: '  JOHN@EXAMPLE.COM  ',
      document: '  12345678900  ',
      active: true,
    });

    expect(adminRef.set).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'John Doe',
        email: 'john@example.com',
        document: '12345678900',
        active: true,
      }),
    );

    expect(result).toEqual(
      expect.objectContaining({
        id: 'admin-1',
        email: 'JOHN@EXAMPLE.COM',
      }),
    );
  });

  it('sets active to true by default on create', async () => {
    adminRef.get.mockResolvedValue(doc('admin-1', { active: true }));

    await service.create({
      name: 'Test Admin',
    });

    expect(adminRef.set).toHaveBeenCalledWith(
      expect.objectContaining({ active: true }),
    );
  });

  it('persists address with normalized state on create', async () => {
    adminRef.get.mockResolvedValue(
      doc('admin-1', {
        name: 'Jane Doe',
        address: {
          address: 'Rua das Flores',
          number: '123',
          neighborhood: 'Centro',
          city: 'São Paulo',
          state: 'SP',
          zipcode: '01234-567',
        },
      }),
    );

    const result = await service.create({
      name: 'Jane Doe',
      address: {
        address: 'Rua das Flores',
        number: '123',
        neighborhood: 'Centro',
        city: 'São Paulo',
        state: 'sp',
        zipcode: '01234-567',
      },
    });

    expect(adminRef.set).toHaveBeenCalledWith(
      expect.objectContaining({
        address: expect.objectContaining({
          address: 'Rua das Flores',
          number: '123',
          state: 'SP',
        }),
      }),
    );

    expect(result.address).toEqual(
      expect.objectContaining({
        state: 'SP',
      }),
    );
  });

  it('throws NotFoundException on findOne when admin does not exist', async () => {
    adminRef.get.mockResolvedValue(doc('admin-1', {}, false));

    await expect(service.findOne('admin-1')).rejects.toThrow(NotFoundException);
    await expect(service.findOne('admin-1')).rejects.toThrow('Admin not found');
  });

  it('returns admin on findOne when exists', async () => {
    adminRef.get.mockResolvedValue(
      doc('admin-1', {
        name: 'John Doe',
        email: 'john@example.com',
        active: true,
      }),
    );

    const result = await service.findOne('admin-1');

    expect(result).toEqual(
      expect.objectContaining({
        id: 'admin-1',
        name: 'John Doe',
        email: 'john@example.com',
        active: true,
      }),
    );
  });

  it('filters admins by active status', async () => {
    const collectionMock = AdminEntity.collectionRef();
    const queryMock = {
      where: jest.fn().mockReturnThis(),
      get: jest.fn().mockResolvedValue({
        docs: [
          doc('admin-1', { name: 'Active Admin', active: true }),
          doc('admin-2', { name: 'Another Active', active: true }),
        ],
      }),
    };

    jest.spyOn(collectionMock, 'orderBy' as any).mockReturnValue(queryMock);

    const result = await service.findAll({ active: true });

    expect(queryMock.where).toHaveBeenCalledWith('active', '==', true);
    expect(result).toHaveLength(2);
  });

  it('filters admins by name substring', async () => {
    const collectionMock = AdminEntity.collectionRef();
    jest.spyOn(collectionMock, 'orderBy' as any).mockReturnValue({
      get: jest.fn().mockResolvedValue({
        docs: [
          doc('admin-1', { name: 'John Doe', email: 'john@example.com' }),
          doc('admin-2', { name: 'Jane Smith', email: 'jane@example.com' }),
        ],
      }),
    } as any);

    const result = await service.findAll({ name: 'john' });

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({ id: 'admin-1', name: 'John Doe' });
  });

  it('filters admins by email substring', async () => {
    const collectionMock = AdminEntity.collectionRef();
    jest.spyOn(collectionMock, 'orderBy' as any).mockReturnValue({
      get: jest.fn().mockResolvedValue({
        docs: [
          doc('admin-1', { name: 'John Doe', email: 'john@example.com' }),
          doc('admin-2', { name: 'Jane Smith', email: 'jane@example.com' }),
        ],
      }),
    } as any);

    const result = await service.findAll({ email: 'john' });

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({ email: 'john@example.com' });
  });

  it('filters admins by document substring', async () => {
    const collectionMock = AdminEntity.collectionRef();
    jest.spyOn(collectionMock, 'orderBy' as any).mockReturnValue({
      get: jest.fn().mockResolvedValue({
        docs: [
          doc('admin-1', { name: 'John', document: '12345678900' }),
          doc('admin-2', { name: 'Jane', document: '98765432100' }),
        ],
      }),
    } as any);

    const result = await service.findAll({ document: '123456' });

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({ document: '12345678900' });
  });

  it('throws NotFoundException on update when admin does not exist', async () => {
    adminRef.get.mockResolvedValue(doc('admin-1', {}, false));

    await expect(
      service.update('admin-1', { name: 'New Name' }),
    ).rejects.toThrow(NotFoundException);
  });

  it('normalizes update payload and persists', async () => {
    adminRef.get.mockResolvedValueOnce(
      doc('admin-1', { name: 'John Doe', email: 'john@example.com' }),
    );
    adminRef.get.mockResolvedValueOnce(
      doc('admin-1', {
        name: 'Jane Doe',
        email: 'jane@example.com',
      }),
    );

    const result = await service.update('admin-1', {
      name: '  Jane Doe  ',
      email: '  JANE@EXAMPLE.COM  ',
      document: '  99999999999  ',
    });

    expect(adminRef.update).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Jane Doe',
        email: 'jane@example.com',
        document: '99999999999',
      }),
    );

    expect(result).toEqual(expect.objectContaining({ id: 'admin-1' }));
  });

  it('rejects update with empty name', async () => {
    adminRef.get.mockResolvedValue(doc('admin-1', { name: 'John Doe' }));

    await expect(service.update('admin-1', { name: '   ' })).rejects.toThrow(
      BadRequestException,
    );
    await expect(service.update('admin-1', { name: '   ' })).rejects.toThrow(
      'name cannot be empty',
    );
  });

  it('persists address updates with normalized state', async () => {
    adminRef.get.mockResolvedValueOnce(
      doc('admin-1', {
        name: 'John Doe',
        address: { state: 'RJ' },
      }),
    );
    adminRef.get.mockResolvedValueOnce(
      doc('admin-1', {
        name: 'John Doe',
        address: { state: 'SP' },
      }),
    );

    const result = await service.update('admin-1', {
      address: {
        address: 'Av. Paulista',
        number: '1000',
        city: 'São Paulo',
        neighborhood: 'Bela Vista',
        state: 'sp',
      },
    });

    expect(adminRef.update).toHaveBeenCalledWith(
      expect.objectContaining({
        address: expect.objectContaining({ state: 'SP' }),
      }),
    );

    expect(result.address?.state).toBe('SP');
  });

  it('throws NotFoundException on remove when admin does not exist', async () => {
    adminRef.get.mockResolvedValue(doc('admin-1', {}, false));

    await expect(service.remove('admin-1')).rejects.toThrow(NotFoundException);
  });

  it('deletes admin when exists', async () => {
    adminRef.get.mockResolvedValue(doc('admin-1', { name: 'John Doe' }));

    await service.remove('admin-1');

    expect(adminRef.delete).toHaveBeenCalled();
  });
});
