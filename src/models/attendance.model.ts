import { BaseModel } from './base.model';

enum AttendanceType {
  CHECKIN = 'checkin',
  CHECKOUT = 'checkout',
}
export class Attendance extends BaseModel {
  attendanceType?: AttendanceType;
  notes?: string;
  companyId?: string;
  collaboratorWhoCheckedInId?: string;
  collaboratorWhoCheckedOutId?: string;
  responsibleIdWhoCheckedInId?: string;
  responsibleIdWhoCheckedOutId?: string;
  childId?: string;
  checkInTime?: Date;
  checkOutTime?: Date;
  timeCheckedInSeconds?: number;

  constructor(init?: Partial<Attendance>) {
    super(init);
    Object.assign(this, init);
  }
}
