import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { FirebaseService } from '../../firebase/firebase.service';
import { hasAdminPrivileges } from '../../constants/roles';

@Injectable()
export class CompanyOwnerOrAdminGuard implements CanActivate {
  constructor(private readonly firebaseService: FirebaseService) {}

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const companyId = request.params?.id ?? request.params?.companyId;
    if (!companyId) {
      return false;
    }

    const requestUser = request.user as
      | { uid?: string; role?: string; roles?: string[] }
      | undefined;

    if (requestUser?.uid) {
      const roles = [
        ...(Array.isArray(requestUser.roles) ? requestUser.roles : []),
        ...(requestUser.role ? [requestUser.role] : []),
      ];

      if (hasAdminPrivileges(roles)) {
        return true;
      }

      return requestUser.uid === companyId;
    }

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
      const decoded = await this.firebaseService.verifyIdToken(token, true);
      const roles = [
        ...(Array.isArray((decoded as any).roles)
          ? (decoded as any).roles
          : []),
        ...((decoded as any).role ? [(decoded as any).role] : []),
      ];

      if (hasAdminPrivileges(roles)) {
        return true;
      }

      return decoded.uid === companyId;
    } catch {
      return false;
    }
  }
}
