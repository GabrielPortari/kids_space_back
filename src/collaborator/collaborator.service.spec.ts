import { Test, TestingModule } from '@nestjs/testing';
import { CollaboratorService } from './collaborator.service';
import { FirebaseService } from '../firebase/firebase.service';

describe('CollaboratorService', () => {
  let service: CollaboratorService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CollaboratorService,
        { provide: FirebaseService, useValue: {} },
      ],
    }).compile();

    service = module.get<CollaboratorService>(CollaboratorService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
