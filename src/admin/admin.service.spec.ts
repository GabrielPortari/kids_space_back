import { AppBadRequestException, AppNotFoundException } from '../exceptions';
import { AdminService } from './admin.service';

describe('AdminService (unit)', () => {
  function makeMockFirestore(docExists = true) {
    const collection = {
      doc: (id: string) => ({
        get: async () => ({ exists: docExists, data: () => (docExists ? { id } : undefined) }),
        set: jest.fn(),
        update: jest.fn(),
      }),
      collection: () => ({ doc: () => ({ set: jest.fn() }) }),
    } as any;

    return {
      collection: (name: string) => collection,
      runTransaction: async (cb: any) => cb({ set: jest.fn(), delete: jest.fn(), get: async () => ({ exists: true }) }),
    } as any;
  }

  const makeMockFirebaseService = () => ({
    createUser: jest.fn(async (u: any) => ({ uid: 'uid123' })),
    setCustomUserClaims: jest.fn(async () => undefined),
    deleteUser: jest.fn(async () => undefined),
  });

  it('getAdminById: throws BadRequest when id missing', async () => {
    const svc = new AdminService(makeMockFirebaseService() as any, makeMockFirestore() as any);
    await expect(svc.getAdminById('')).rejects.toBeInstanceOf(AppBadRequestException);
  });

  it('getAdminById: throws NotFound when admin does not exist', async () => {
    const svc = new AdminService(makeMockFirebaseService() as any, makeMockFirestore(false) as any);
    await expect(svc.getAdminById('missing')).rejects.toBeInstanceOf(AppNotFoundException);
  });

  it('registerSystemAdmin: creates admin and returns firestore object', async () => {
    const mockFs = makeMockFirestore(true);
    const mockFirebase = makeMockFirebaseService();
    const svc = new AdminService(mockFirebase as any, mockFs as any);

    const dto: any = { email: 'a@b.com', password: 'pass', name: 'Name', roles: ['master'], userType: 'system', status: 'active' };
    const res = await svc.registerSystemAdmin(dto);

    expect(res).toHaveProperty('id', 'uid123');
    expect(mockFirebase.createUser).toHaveBeenCalled();
  });
});
