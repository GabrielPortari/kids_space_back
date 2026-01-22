import { CompanyService } from './company.service';

describe('CompanyService', () => {
  let service: CompanyService;

  beforeEach(() => {
    const mockFirebaseService: any = {};
    const mockFirestore: any = { collection: () => ({}) };
    service = new CompanyService(mockFirebaseService, mockFirestore);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
