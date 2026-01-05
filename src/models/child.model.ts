import { BaseUser } from './base-user.model';

export class Child extends BaseUser {
  responsibleUserIds?: string[];
  isActive?: boolean;

  constructor(init?: Partial<Child>) {
    super(init);
    Object.assign(this, init);
  }
}
