import { BaseUser } from './base-user.model';

export class Child extends BaseUser {
  responsibleUserIds?: string[];
  status?: boolean;

  constructor(init?: Partial<Child>) {
    super(init);
    Object.assign(this, init);
  }
}
