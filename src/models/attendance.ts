import { BaseModel } from "./base.model";

export class Attendance extends BaseModel{
    attendanceType?: 'checkin' | 'checkout';
    notes?: string;
    companyId?: string;
    collaboratorCheckedInId?: string;
    collaboratorCheckedOutId?: string;
    responsibleId?: string;
    childId?: string;
    checkInTime?: Date;
    checkOutTime?: Date;
    timeCheckedIn?: number;

  constructor(init?: Partial<Attendance>) {
    super(init);
    Object.assign(this, init);
  }
}