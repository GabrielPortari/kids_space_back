import { BaseUser } from './base-user.model';

export class User extends BaseUser {
  childrenIds?: string[];

  constructor(init?: Partial<User>) {
    super(init);
    Object.assign(this, init);
  }
}
