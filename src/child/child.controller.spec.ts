import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { ChildController } from './child.controller';
import { ChildService } from './child.service';
import { FirebaseService } from '../firebase/firebase.service';

describe('ChildController', () => {
  let controller: ChildController;
  const childServiceMock = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };
  const firebaseServiceMock = {
    verifyIdToken: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ChildController],
      providers: [
        { provide: ChildService, useValue: childServiceMock },
        { provide: FirebaseService, useValue: firebaseServiceMock },
      ],
    }).compile();

    controller = module.get<ChildController>(ChildController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should throw when create token is missing', async () => {
    await expect(controller.create('', {} as any, {})).rejects.toThrow(
      new BadRequestException('id token is required'),
    );
  });

  it('should create child with actor company from token claim', async () => {
    const dto = { name: 'Child 1' } as any;
    firebaseServiceMock.verifyIdToken.mockResolvedValue({
      uid: 'uid-1',
      companyId: 'company-1',
    });

    await controller.create('token', dto, { user: { role: 'collaborator' } });

    expect(childServiceMock.create).toHaveBeenCalledWith(dto, 'company-1', [
      'collaborator',
    ]);
  });

  it('should list children using uid fallback for company id', async () => {
    firebaseServiceMock.verifyIdToken.mockResolvedValue({ uid: 'uid-1' });

    await controller.findAll('token', {} as any, { user: {} });

    expect(childServiceMock.findAll).toHaveBeenCalledWith('uid-1', {}, []);
  });

  it('should proxy findOne update and delete', async () => {
    childServiceMock.findOne.mockResolvedValue({ childId: 'ch-1' });
    firebaseServiceMock.verifyIdToken.mockResolvedValue({ uid: 'uid-1' });

    await controller.findOne('ch-1');
    await controller.update('token', 'ch-1', { nickname: 'Kid' } as any, {
      user: { role: 'admin' },
    });
    await controller.delete('token', 'ch-1', { user: { roles: ['admin'] } });

    expect(childServiceMock.findOne).toHaveBeenCalledWith('ch-1');
    expect(childServiceMock.update).toHaveBeenCalled();
    expect(childServiceMock.delete).toHaveBeenCalled();
  });
});
