import { Address } from './address.model';
import { BaseModel } from './base.model';

export class User extends BaseModel {
  name: string;
  parents?: string[]; // array of parent IDs
  document?: string;
  address?: Address;
  email?: string;
  contact?: string;
  companyId?: string;

  constructor(init?: Partial<User>) {
    super(init);
    Object.assign(this, init);
  }
}
