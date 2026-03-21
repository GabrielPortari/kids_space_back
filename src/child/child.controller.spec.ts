import { Test, TestingModule } from '@nestjs/testing';
import { ChildController } from './child.controller';
import { ChildService } from './child.service';
import { FirebaseService } from '../firebase/firebase.service';

describe('ChildController', () => {
  let controller: ChildController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ChildController],
      providers: [
        ChildService,
        {
          provide: FirebaseService,
          useValue: {
            verifyIdToken: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<ChildController>(ChildController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
