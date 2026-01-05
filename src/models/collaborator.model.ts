import { BaseUser } from './base-user.model';

export class Collaborator extends BaseUser {
  password?: string;

  constructor(init?: Partial<Collaborator>) {
    super(init);
    Object.assign(this, init);
  }
}
