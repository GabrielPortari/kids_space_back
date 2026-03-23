import { BaseModel } from './base.model';
import { Address } from './address.model';

export class Admin extends BaseModel {
  name: string;
  email?: string;
  document?: string;
  contact?: string;
  address?: Address;
  active?: boolean;

  constructor(init?: Partial<Admin>) {
    super(init);
    Object.assign(this, init);
  }
}
