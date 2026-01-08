import { BaseModel } from './base.model';

export type UserType = 'child' | 'user' | 'collaborator' | 'companyAdmin' | 'systemAdmin' | 'master';

export class BaseUser extends BaseModel {
  userType?: UserType;
  photoUrl?: string;
  name?: string;
  email?: string;
  phone?: string;
  birthDate?: Date | string;
  document?: string;
  address?: string;
  addressNumber?: string;
  addressComplement?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  companyId?: string;

  constructor(init?: Partial<BaseUser>) {
    super(init);
    Object.assign(this, init);
  }
}
