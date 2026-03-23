import { ExecutionContext, NotFoundException } from '@nestjs/common';
import { ChildOwnerOrCompanyGuard } from './child-owner-or-company.guard';
import { FirebaseService } from '../../firebase/firebase.service';
import { ChildEntity } from '../entities/child.entity';

describe('ChildOwnerOrCompanyGuard', () => {
  const verifyIdToken = jest.fn();
  const firebaseServiceMock = {
    verifyIdToken,
  } as unknown as FirebaseService;

  const guard = new ChildOwnerOrCompanyGuard(firebaseServiceMock);

  function mockContext(request: any): ExecutionContext {
    return {
      switchToHttp: () => ({ getRequest: () => request }),
    } as unknown as ExecutionContext;
  }

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('allows admin from request.user without token verification', async () => {
    const allowed = await guard.canActivate(
      mockContext({
        params: { childId: 'child-1' },
        headers: {},
        user: { uid: 'admin-1', role: 'admin' },
      }),
    );

    expect(allowed).toBe(true);
    expect(verifyIdToken).not.toHaveBeenCalled();
  });

  it('allows company owner from request.user when child belongs to same company', async () => {
    jest.spyOn(ChildEntity, 'docRef').mockReturnValue({
      get: jest.fn().mockResolvedValue({ exists: true }),
    } as any);
    jest.spyOn(ChildEntity, 'fromFirestore').mockReturnValue({
      companyId: 'company-1',
    } as any);

    const allowed = await guard.canActivate(
      mockContext({
        params: { childId: 'child-1' },
        headers: {},
        user: { uid: 'user-1', role: 'company', companyId: 'company-1' },
      }),
    );

    expect(allowed).toBe(true);
    expect(verifyIdToken).not.toHaveBeenCalled();
  });

  it('falls back to auth header when request.user is absent', async () => {
    verifyIdToken.mockResolvedValue({
      uid: 'user-1',
      role: 'company',
      companyId: 'company-1',
    });
    jest.spyOn(ChildEntity, 'docRef').mockReturnValue({
      get: jest.fn().mockResolvedValue({ exists: true }),
    } as any);
    jest.spyOn(ChildEntity, 'fromFirestore').mockReturnValue({
      companyId: 'company-1',
    } as any);

    const allowed = await guard.canActivate(
      mockContext({
        params: { childId: 'child-1' },
        headers: { authorization: 'Bearer valid-token' },
      }),
    );

    expect(allowed).toBe(true);
    expect(verifyIdToken).toHaveBeenCalledWith('valid-token', true);
  });

  it('throws NotFoundException when child does not exist', async () => {
    verifyIdToken.mockResolvedValue({ uid: 'user-1', role: 'company' });
    jest.spyOn(ChildEntity, 'docRef').mockReturnValue({
      get: jest.fn().mockResolvedValue({ exists: false }),
    } as any);

    await expect(
      guard.canActivate(
        mockContext({
          params: { childId: 'child-404' },
          headers: { authorization: 'Bearer valid-token' },
        }),
      ),
    ).rejects.toThrow(NotFoundException);
  });

  it('denies when request.user and auth header are missing', async () => {
    const allowed = await guard.canActivate(
      mockContext({
        params: { childId: 'child-1' },
        headers: {},
      }),
    );

    expect(allowed).toBe(false);
    expect(verifyIdToken).not.toHaveBeenCalled();
  });
});
