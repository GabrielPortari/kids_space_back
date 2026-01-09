import { BaseModel } from "./base.model";

export class Attendance extends BaseModel{
    attendanceType?: 'checkin' | 'checkout';
    status?: 'open' | 'closed';
    notes?: string;
    collaboratorCheckedInId?: string;
    collaboratorCheckedOutId?: string;
    responsibleId?: string;
    childId?: string;
    checkInTime?: Date;
    checkOutTime?: Date;
    timeCheckedIn?: string;

  constructor(init?: Partial<Attendance>) {
    super(init);
    Object.assign(this, init);
  }
}