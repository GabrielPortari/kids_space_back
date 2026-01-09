import { BaseModel } from "./base.model";

export class CheckInOut extends BaseModel{
    checkType?: 'checkin' | 'checkout';
    statys?: 'open' | 'closed';
    collaboratorId?: string;
    childId?: string;
    checkInTime?: Date;
    checkOutTime?: Date;
    notes?: string;

  constructor(init?: Partial<CheckInOut>) {
    super(init);
    Object.assign(this, init);
  }
}