import {
  CanActivate,
  ExecutionContext,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { FirebaseService } from '../../firebase/firebase.service';
import { hasAdminPrivileges } from '../../constants/roles';
import { AttendanceEntity } from '../entities/attendance.entity';

@Injectable()
export class AttendanceOwnerOrCompanyGuard implements CanActivate {
  constructor(private readonly firebaseService: FirebaseService) {}

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const attendanceId = request.params?.attendanceId ?? request.params?.id;
    const authHeader =
      request.headers['authorization'] || request.headers['Authorization'];

    if (!attendanceId || !authHeader) {
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

      const attendanceDoc = await AttendanceEntity.docRef(attendanceId).get();
      if (!attendanceDoc.exists) {
        throw new NotFoundException('Attendance not found');
      }

      const attendance = AttendanceEntity.fromFirestore(attendanceDoc);
      const actorCompanyId = (decoded as any).companyId || decoded.uid;
      return attendance.companyId === actorCompanyId;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      return false;
    }
  }
}
