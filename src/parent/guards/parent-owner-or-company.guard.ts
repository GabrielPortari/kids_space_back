import {
  CanActivate,
  ExecutionContext,
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { FirebaseService } from '../../firebase/firebase.service';
import { Role } from '../../constants/roles';
import { ParentEntity } from '../entities/parent.entity';

@Injectable()
export class ParentOwnerOrCompanyGuard implements CanActivate {
  constructor(private readonly firebaseService: FirebaseService) {}

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const parentId = request.params?.parentId ?? request.params?.id;
    const authHeader =
      request.headers['authorization'] || request.headers['Authorization'];

    if (!parentId || !authHeader) {
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

      // Admin has full access
      if (roles.includes(Role.ADMIN)) {
        return true;
      }

      // Get parent's companyId to validate scoping
      const parentDoc = await ParentEntity.docRef(parentId).get();
      if (!parentDoc.exists) {
        throw new NotFoundException('Parent not found');
      }

      const parent = ParentEntity.fromFirestore(parentDoc);

      // Collaborator or Company must be from the same company
      const actorCompanyId = (decoded as any).companyId || decoded.uid;
      return parent.companyId === actorCompanyId;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }
      return false;
    }
  }
}
