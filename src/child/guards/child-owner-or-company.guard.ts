import {
  CanActivate,
  ExecutionContext,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { FirebaseService } from '../../firebase/firebase.service';
import { hasAdminPrivileges } from '../../constants/roles';
import { ChildEntity } from '../entities/child.entity';

@Injectable()
export class ChildOwnerOrCompanyGuard implements CanActivate {
  constructor(private readonly firebaseService: FirebaseService) {}

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const childId = request.params?.childId ?? request.params?.id;
    const authHeader =
      request.headers['authorization'] || request.headers['Authorization'];

    if (!childId || !authHeader) {
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

      const childDoc = await ChildEntity.docRef(childId).get();
      if (!childDoc.exists) {
        throw new NotFoundException('Child not found');
      }

      const child = ChildEntity.fromFirestore(childDoc);
      const actorCompanyId = (decoded as any).companyId || decoded.uid;

      return child.companyId === actorCompanyId;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      return false;
    }
  }
}
