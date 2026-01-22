import { UserService } from './user.service';

describe('UserService', () => {
  let service: UserService;

  beforeEach(() => {
    const mockFirestore: any = { collection: () => ({}) };
    service = new UserService(mockFirestore);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
