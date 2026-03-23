import { Address } from './address.model';
import { BaseModel } from './base.model';

export class Company extends BaseModel {
  name: string;
  legalName: string;
  cnpj: string;
  website?: string;
  logoUrl?: string;
  address?: Address;
  contact: string; //TODO: tipar com formato de telefone
  email: string; //TODO: tipar com formato de email
  verified: boolean;
  active: boolean;

  constructor(init?: Partial<Company>) {
    super(init);
    Object.assign(this, init);
  }
}
