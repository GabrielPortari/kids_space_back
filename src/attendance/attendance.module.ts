import { Module } from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { AttendanceController } from './attendance.controller';
import { AttendanceOwnerOrCompanyGuard } from './guards/attendance-owner-or-company.guard';

@Module({
  controllers: [AttendanceController],
  providers: [AttendanceService, AttendanceOwnerOrCompanyGuard],
})
export class AttendanceModule {}
