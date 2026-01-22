import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(() => {
    const mockFirebaseService: any = {};
    service = new AuthService(mockFirebaseService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
