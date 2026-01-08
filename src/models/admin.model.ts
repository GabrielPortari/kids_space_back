import { BaseUser } from './base-user.model';

export class Admin extends BaseUser {
  roles?: string[];
  status?: 'active' | 'inactive';
  constructor(init?: Partial<Admin>) {
    super(init);
    Object.assign(this, init);
  }
}
