import { ExecutionContext, HttpException } from '@nestjs/common';
import { AuthRateLimitGuard } from './auth-rate-limit.guard';

describe('AuthRateLimitGuard', () => {
  let guard: AuthRateLimitGuard;

  function makeContext(request: any): ExecutionContext {
    return {
      switchToHttp: () => ({
        getRequest: () => request,
      }),
    } as unknown as ExecutionContext;
  }

  beforeEach(() => {
    guard = new AuthRateLimitGuard();
  });

  it('allows requests below identity limit', () => {
    const req = {
      method: 'POST',
      baseUrl: '/auth',
      route: { path: '/login' },
      ip: '127.0.0.1',
      headers: {},
      body: { email: 'user@example.com' },
    };

    expect(() => guard.canActivate(makeContext(req))).not.toThrow();
  });

  it('blocks when identity limit is exceeded', () => {
    const req = {
      method: 'POST',
      baseUrl: '/auth',
      route: { path: '/login' },
      ip: '127.0.0.1',
      headers: {},
      body: { email: 'victim@example.com' },
    };

    for (let i = 0; i < 5; i++) {
      guard.canActivate(makeContext(req));
    }

    try {
      guard.canActivate(makeContext(req));
      fail('Expected HttpException with status 429');
    } catch (error) {
      expect(error).toBeInstanceOf(HttpException);
      expect((error as HttpException).getStatus()).toBe(429);
    }
  });

  it('blocks when IP limit is exceeded even with different identities', () => {
    const ip = '127.0.0.1';

    for (let i = 0; i < 20; i++) {
      const req = {
        method: 'POST',
        baseUrl: '/auth',
        route: { path: '/login' },
        ip,
        headers: {},
        body: { email: `user${i}@example.com` },
      };
      guard.canActivate(makeContext(req));
    }

    const overflowReq = {
      method: 'POST',
      baseUrl: '/auth',
      route: { path: '/login' },
      ip,
      headers: {},
      body: { email: 'another@example.com' },
    };

    try {
      guard.canActivate(makeContext(overflowReq));
      fail('Expected HttpException with status 429');
    } catch (error) {
      expect(error).toBeInstanceOf(HttpException);
      expect((error as HttpException).getStatus()).toBe(429);
    }
  });

  it('cleans up stale trackers during periodic cleanup', () => {
    const now = 1_700_000_000_000;
    const dateNowSpy = jest.spyOn(Date, 'now').mockReturnValue(now);

    (guard as any).attempts.set('stale-key', {
      timestamps: [now - 20 * 60_000],
      lastSeen: now - 20 * 60_000,
    });

    const req = {
      method: 'POST',
      baseUrl: '/auth',
      route: { path: '/login' },
      ip: '127.0.0.1',
      headers: {},
      body: { email: 'user@example.com' },
    };

    guard.canActivate(makeContext(req));

    expect((guard as any).attempts.has('stale-key')).toBe(false);
    dateNowSpy.mockRestore();
  });

  it('evicts oldest trackers when max size is exceeded', () => {
    const now = 1_700_000_000_000;
    const dateNowSpy = jest.spyOn(Date, 'now').mockReturnValue(now);

    (guard as any).maxTrackers = 3;
    (guard as any).attempts.set('k1', {
      timestamps: [now - 3_000],
      lastSeen: now - 3_000,
    });
    (guard as any).attempts.set('k2', {
      timestamps: [now - 2_000],
      lastSeen: now - 2_000,
    });
    (guard as any).attempts.set('k3', {
      timestamps: [now - 1_000],
      lastSeen: now - 1_000,
    });

    const req = {
      method: 'POST',
      baseUrl: '/auth',
      route: { path: '/login' },
      ip: '127.0.0.1',
      headers: {},
      body: { email: 'new-user@example.com' },
    };

    guard.canActivate(makeContext(req));

    expect((guard as any).attempts.size).toBeLessThanOrEqual(3);
    dateNowSpy.mockRestore();
  });
});
