import { Address } from './address.model';
import { BaseModel } from './base.model';

export class Collaborator extends BaseModel {
  companyId: string;
  name: string;
  document?: string;
  address?: Address;
  email?: string;
  contact?: string;
}
