import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { ParentController } from './parent.controller';
import { ParentService } from './parent.service';
import { FirebaseService } from '../firebase/firebase.service';

describe('ParentController', () => {
  let controller: ParentController;
  const parentServiceMock = {
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
      controllers: [ParentController],
      providers: [
        { provide: ParentService, useValue: parentServiceMock },
        { provide: FirebaseService, useValue: firebaseServiceMock },
      ],
    }).compile();

    controller = module.get<ParentController>(ParentController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should throw when token is missing on create', async () => {
    await expect(controller.create('', {} as any, {})).rejects.toThrow(
      new BadRequestException('id token is required'),
    );
  });

  it('should call create with companyId claim and merged roles', async () => {
    const dto = { name: 'Parent 1' } as any;
    firebaseServiceMock.verifyIdToken.mockResolvedValue({
      uid: 'uid-1',
      companyId: 'company-1',
    });

    await controller.create('token', dto, {
      user: { roles: ['collaborator'], role: 'company' },
    });

    expect(parentServiceMock.create).toHaveBeenCalledWith(dto, 'company-1', [
      'collaborator',
      'company',
    ]);
  });

  it('should fallback actor company to uid when claim is missing', async () => {
    firebaseServiceMock.verifyIdToken.mockResolvedValue({ uid: 'uid-1' });

    await controller.findAll('token', {} as any, { user: {} });

    expect(parentServiceMock.findAll).toHaveBeenCalledWith('uid-1', {}, []);
  });

  it('should proxy findOne update and delete', async () => {
    parentServiceMock.findOne.mockResolvedValue({ parentId: 'p-1' });
    firebaseServiceMock.verifyIdToken.mockResolvedValue({ uid: 'uid-1' });

    await controller.findOne('p-1');
    await controller.update('token', 'p-1', { name: 'Updated' } as any, {
      user: { role: 'admin' },
    });
    await controller.delete('token', 'p-1', { user: { roles: ['admin'] } });

    expect(parentServiceMock.findOne).toHaveBeenCalledWith('p-1');
    expect(parentServiceMock.update).toHaveBeenCalled();
    expect(parentServiceMock.delete).toHaveBeenCalled();
  });
});
