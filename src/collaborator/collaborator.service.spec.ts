import { CollaboratorService } from './collaborator.service';

describe('CollaboratorService', () => {
  let service: CollaboratorService;

  beforeEach(() => {
    const mockFirebaseService: any = {};
    const mockFirestore: any = { collection: () => ({}) };
    service = new CollaboratorService(mockFirebaseService, mockFirestore);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
