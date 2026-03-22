import {
  CanActivate,
  ExecutionContext,
  Injectable,
  mixin,
  Type,
} from '@nestjs/common';
import { FirebaseService } from '../firebase/firebase.service';
import { Role } from '../constants/roles';

export function RolesGuard(...allowedRoles: string[]): Type<CanActivate> {
  const effectiveAllowedRoles = allowedRoles.includes(Role.ADMIN)
    ? [...new Set([...allowedRoles, Role.MASTER])]
    : allowedRoles;

  @Injectable()
  class RoleGuardMixin implements CanActivate {
    constructor(private readonly firebaseService: FirebaseService) {}

    async canActivate(context: ExecutionContext) {
      const request = context.switchToHttp().getRequest();
      const authHeader =
        request.headers['authorization'] || request.headers['Authorization'];
      if (!authHeader) {
        return false;
      }

      const [bearer, token] = authHeader.split(' ');
      if (bearer !== 'Bearer' || !token) {
        return false;
      }

      try {
        const decodedToken = await this.firebaseService.verifyIdToken(
          token,
          true,
        );
        const userRoles = [
          ...(Array.isArray((decodedToken as any).roles)
            ? (decodedToken as any).roles
            : []),
          ...((decodedToken as any).role ? [(decodedToken as any).role] : []),
        ];

        request.user = decodedToken;

        return effectiveAllowedRoles.some((required) =>
          userRoles.includes(required),
        );
      } catch {
        return false;
      }
    }
  }

  return mixin(RoleGuardMixin);
}
