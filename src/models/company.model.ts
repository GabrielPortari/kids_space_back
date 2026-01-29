import { BaseModel } from './base.model';

export class Company extends BaseModel {
  fantasyName?: string;
  corporateName?: string;
  cnpj?: string;
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
  responsibleId?: string;
  collaborators?: number;
  users?: number;
  children?: number;

  constructor(init?: Partial<Company>) {
    super(init);
    Object.assign(this, init);
  }
}
