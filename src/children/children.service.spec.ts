import { ChildrenService } from './children.service';

describe('ChildrenService', () => {
  let service: ChildrenService;

  beforeEach(() => {
    const mockFirestore: any = { collection: () => ({}) };
    service = new ChildrenService(mockFirestore);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
