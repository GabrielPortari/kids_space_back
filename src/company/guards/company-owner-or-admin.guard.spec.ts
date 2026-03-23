import { ExecutionContext } from '@nestjs/common';
import { CompanyOwnerOrAdminGuard } from './company-owner-or-admin.guard';
import { FirebaseService } from '../../firebase/firebase.service';

describe('CompanyOwnerOrAdminGuard', () => {
  const verifyIdToken = jest.fn();
  const firebaseServiceMock = {
    verifyIdToken,
  } as unknown as FirebaseService;

  const guard = new CompanyOwnerOrAdminGuard(firebaseServiceMock);

  function mockContext(request: any): ExecutionContext {
    return {
      switchToHttp: () => ({ getRequest: () => request }),
    } as unknown as ExecutionContext;
  }

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('allows owner when uid matches route id', async () => {
    verifyIdToken.mockResolvedValue({ uid: 'biz-1', role: 'company' });

    const allowed = await guard.canActivate(
      mockContext({
        params: { id: 'biz-1' },
        headers: { authorization: 'Bearer owner-token' },
      }),
    );

    expect(allowed).toBe(true);
  });

  it('reuses request.user for owner and skips token verification', async () => {
    const allowed = await guard.canActivate(
      mockContext({
        params: { id: 'biz-1' },
        headers: {},
        user: { uid: 'biz-1', role: 'company' },
      }),
    );

    expect(allowed).toBe(true);
    expect(verifyIdToken).not.toHaveBeenCalled();
  });

  it('reuses request.user for admin and skips token verification', async () => {
    const allowed = await guard.canActivate(
      mockContext({
        params: { id: 'biz-1' },
        headers: {},
        user: { uid: 'admin-1', role: 'admin' },
      }),
    );

    expect(allowed).toBe(true);
    expect(verifyIdToken).not.toHaveBeenCalled();
  });

  it('allows admin for any company id', async () => {
    verifyIdToken.mockResolvedValue({ uid: 'admin-1', role: 'admin' });

    const allowed = await guard.canActivate(
      mockContext({
        params: { id: 'biz-1' },
        headers: { authorization: 'Bearer admin-token' },
      }),
    );

    expect(allowed).toBe(true);
  });

  it('denies non-owner company', async () => {
    verifyIdToken.mockResolvedValue({ uid: 'biz-2', role: 'company' });

    const allowed = await guard.canActivate(
      mockContext({
        params: { id: 'biz-1' },
        headers: { authorization: 'Bearer other-company-token' },
      }),
    );

    expect(allowed).toBe(false);
  });

  it('denies when token verification fails', async () => {
    verifyIdToken.mockRejectedValue(new Error('invalid token'));

    const allowed = await guard.canActivate(
      mockContext({
        params: { id: 'biz-1' },
        headers: { authorization: 'Bearer invalid-token' },
      }),
    );

    expect(allowed).toBe(false);
  });

  it('denies when request.user is absent and auth header is missing', async () => {
    const allowed = await guard.canActivate(
      mockContext({
        params: { id: 'biz-1' },
        headers: {},
      }),
    );

    expect(allowed).toBe(false);
    expect(verifyIdToken).not.toHaveBeenCalled();
  });
});
