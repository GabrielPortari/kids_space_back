import { BaseUser } from './base-user.model';

export class Admin extends BaseUser {
  constructor(init?: Partial<Admin>) {
    super(init);
    Object.assign(this, init);
  }
}
