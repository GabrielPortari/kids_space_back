import { BaseUser } from './base-user.model';

export class Collaborator extends BaseUser {
  roles?: string[];
  status?: 'active' | 'inactive';
  constructor(init?: Partial<Collaborator>) {
    super(init);
    Object.assign(this, init);
  }
}
