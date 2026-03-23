import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { CollaboratorController } from './collaborator.controller';
import { CollaboratorService } from './collaborator.service';
import { FirebaseService } from '../firebase/firebase.service';

describe('CollaboratorController', () => {
  let controller: CollaboratorController;
  const collaboratorServiceMock = {
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
      controllers: [CollaboratorController],
      providers: [
        { provide: CollaboratorService, useValue: collaboratorServiceMock },
        { provide: FirebaseService, useValue: firebaseServiceMock },
      ],
    }).compile();

    controller = module.get<CollaboratorController>(CollaboratorController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should throw when create is called without token', async () => {
    await expect(controller.create('', {} as any, {})).rejects.toThrow(
      new BadRequestException('id token is required'),
    );
  });

  it('should create using companyId claim when present', async () => {
    const dto = { name: 'Colab 1' } as any;
    const request = { user: { roles: ['companyAdmin'], role: 'company' } };
    firebaseServiceMock.verifyIdToken.mockResolvedValue({
      uid: 'uid-1',
      companyId: 'company-1',
    });

    await controller.create('token', dto, request);

    expect(collaboratorServiceMock.create).toHaveBeenCalledWith(
      dto,
      'company-1',
      ['companyAdmin', 'company'],
    );
  });

  it('should fallback to uid when companyId claim is missing', async () => {
    firebaseServiceMock.verifyIdToken.mockResolvedValue({ uid: 'uid-1' });

    await controller.findAll('token', {} as any, { user: {} });

    expect(collaboratorServiceMock.findAll).toHaveBeenCalledWith(
      'uid-1',
      {},
      [],
    );
  });

  it('should proxy findOne/update/delete to service', async () => {
    collaboratorServiceMock.findOne.mockResolvedValue({
      collaboratorId: 'c-1',
    });

    await controller.findOne('c-1');
    await controller.update('token', 'c-1', { active: true } as any, {
      user: { role: 'admin' },
    });
    await controller.delete('token', 'c-1', { user: { roles: ['admin'] } });

    expect(collaboratorServiceMock.findOne).toHaveBeenCalledWith('c-1');
    expect(collaboratorServiceMock.update).toHaveBeenCalled();
    expect(collaboratorServiceMock.delete).toHaveBeenCalled();
  });
});
