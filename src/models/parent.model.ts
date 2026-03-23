import { Address } from './address.model';
import { BaseModel } from './base.model';

export class Parent extends BaseModel {
  name: string;
  children?: string[]; // array of child IDs
  document?: string;
  address?: Address;
  email?: string;
  contact?: string;
  companyId?: string;

  constructor(init?: Partial<Parent>) {
    super(init);
    Object.assign(this, init);
  }
}
