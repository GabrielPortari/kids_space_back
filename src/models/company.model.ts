import { BaseModel } from './base.model';

export class Company extends BaseModel {
  fantasyName?: string;
  legalName?: string;
  document?: string;
  website?: string;
  address?: string;
  addressNumber?: string;
  addressComplement?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  phone?: string;
  email?: string;
  logoUrl?: string;
  collaboratorIds?: string[];
  userIds?: string[];
  childIds?: string[];

  constructor(init?: Partial<Company>) {
    super(init);
    Object.assign(this, init);
  }
}
