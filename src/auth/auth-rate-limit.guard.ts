import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { createHash } from 'crypto';

type RouteLimit = {
  windowMs: number;
  maxByIp: number;
  maxByIdentity: number;
};

type AttemptBucket = {
  timestamps: number[];
  lastSeen: number;
};

@Injectable()
export class AuthRateLimitGuard implements CanActivate {
  private readonly attempts = new Map<string, AttemptBucket>();
  private lastCleanupAt = 0;
  private readonly cleanupIntervalMs = 60_000;
  private readonly maxTrackers = 10_000;
  private readonly maxWindowMs: number;

  private readonly routeLimits: Record<string, RouteLimit> = {
    'POST:/auth/login': {
      windowMs: 60_000,
      maxByIp: 20,
      maxByIdentity: 5,
    },
    'POST:/auth/refresh-auth': {
      windowMs: 60_000,
      maxByIp: 30,
      maxByIdentity: 8,
    },
    'POST:/auth/recover-password': {
      windowMs: 15 * 60_000,
      maxByIp: 12,
      maxByIdentity: 3,
    },
  };

  constructor() {
    this.maxWindowMs = Math.max(
      ...Object.values(this.routeLimits).map((limit) => limit.windowMs),
    );
  }

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const routeKey = this.getRouteKey(request);
    const limits = this.routeLimits[routeKey];

    if (!limits) {
      return true;
    }

    const now = Date.now();
    this.maybeCleanup(now);

    const ipTracker = this.getClientIp(request);
    const identityTracker = this.getIdentityTracker(
      routeKey,
      request.body ?? {},
    );

    const ipCount = this.registerAttempt(
      `ip:${routeKey}:${ipTracker}`,
      now,
      limits.windowMs,
    );
    const identityCount = this.registerAttempt(
      `identity:${routeKey}:${identityTracker}`,
      now,
      limits.windowMs,
    );

    if (ipCount > limits.maxByIp || identityCount > limits.maxByIdentity) {
      throw new HttpException(
        'Too many attempts. Please try again later.',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    return true;
  }

  private registerAttempt(key: string, now: number, windowMs: number): number {
    const threshold = now - windowMs;
    const current = this.attempts.get(key);
    const valid = (current?.timestamps ?? []).filter((ts) => ts >= threshold);
    valid.push(now);
    this.attempts.set(key, { timestamps: valid, lastSeen: now });

    if (this.attempts.size > this.maxTrackers) {
      this.evictOldest(this.attempts.size - this.maxTrackers);
    }

    return valid.length;
  }

  private maybeCleanup(now: number): void {
    const shouldRunByTime = now - this.lastCleanupAt >= this.cleanupIntervalMs;
    const shouldRunBySize = this.attempts.size > this.maxTrackers;

    if (!shouldRunByTime && !shouldRunBySize) {
      return;
    }

    this.lastCleanupAt = now;
    const threshold = now - this.maxWindowMs;

    for (const [key, bucket] of this.attempts.entries()) {
      const valid = bucket.timestamps.filter((ts) => ts >= threshold);

      if (valid.length === 0) {
        this.attempts.delete(key);
        continue;
      }

      this.attempts.set(key, {
        timestamps: valid,
        lastSeen: valid[valid.length - 1],
      });
    }

    if (this.attempts.size > this.maxTrackers) {
      this.evictOldest(this.attempts.size - this.maxTrackers);
    }
  }

  private evictOldest(count: number): void {
    if (count <= 0) {
      return;
    }

    const oldest = [...this.attempts.entries()]
      .sort((a, b) => a[1].lastSeen - b[1].lastSeen)
      .slice(0, count);

    for (const [key] of oldest) {
      this.attempts.delete(key);
    }
  }

  private getRouteKey(request: any): string {
    const method = String(request.method || 'GET').toUpperCase();
    const base = String(request.baseUrl || '').replace(/\/$/, '');
    const path = String(request.route?.path || request.path || '').replace(
      /\/$/,
      '',
    );
    return `${method}:${base}${path}`;
  }

  private getClientIp(request: any): string {
    const forwardedFor = request.headers?.['x-forwarded-for'];
    if (typeof forwardedFor === 'string' && forwardedFor.trim()) {
      return forwardedFor.split(',')[0].trim();
    }

    if (Array.isArray(request.ips) && request.ips.length > 0) {
      return request.ips[0];
    }

    return request.ip || request.socket?.remoteAddress || 'unknown-ip';
  }

  private getIdentityTracker(
    routeKey: string,
    body: Record<string, any>,
  ): string {
    if (
      routeKey === 'POST:/auth/login' ||
      routeKey === 'POST:/auth/recover-password'
    ) {
      return (
        String(body.email || '')
          .trim()
          .toLowerCase() || 'anonymous'
      );
    }

    if (routeKey === 'POST:/auth/refresh-auth') {
      const refreshToken = String(body.refreshToken || '').trim();
      if (!refreshToken) return 'anonymous';
      return createHash('sha256')
        .update(refreshToken)
        .digest('hex')
        .slice(0, 16);
    }

    return 'anonymous';
  }
}
