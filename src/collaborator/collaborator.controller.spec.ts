import { Test, TestingModule } from '@nestjs/testing';
import { CollaboratorController } from './collaborator.controller';
import { CollaboratorService } from './collaborator.service';
import { FirebaseService } from 'src/firebase/firebase.service';

describe('CollaboratorController', () => {
  let controller: CollaboratorController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CollaboratorController],
      providers: [
        CollaboratorService,
        {
          provide: FirebaseService,
          useValue: {
            verifyIdToken: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<CollaboratorController>(CollaboratorController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
