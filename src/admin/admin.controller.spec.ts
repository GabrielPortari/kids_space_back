import { Test, TestingModule } from '@nestjs/testing';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { FirebaseService } from '../firebase/firebase.service';

describe('AdminController', () => {
  let controller: AdminController;
  const adminServiceMock = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };
  const firebaseServiceMock = {
    verifyIdToken: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminController],
      providers: [
        { provide: AdminService, useValue: adminServiceMock },
        { provide: FirebaseService, useValue: firebaseServiceMock },
      ],
    }).compile();

    controller = module.get<AdminController>(AdminController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create admin', async () => {
    const dto = { email: 'admin@kids.space' } as any;
    const created = { adminId: 'admin-1' };
    adminServiceMock.create.mockResolvedValue(created);

    const result = await controller.create(dto);

    expect(adminServiceMock.create).toHaveBeenCalledWith(dto);
    expect(result).toEqual(created);
  });

  it('should list admins', async () => {
    const query = { page: 1, limit: 10 } as any;
    const response = { items: [{ adminId: 'admin-1' }] };
    adminServiceMock.findAll.mockResolvedValue(response);

    const result = await controller.findAll(query);

    expect(adminServiceMock.findAll).toHaveBeenCalledWith(query);
    expect(result).toEqual(response);
  });

  it('should get admin by id', async () => {
    const response = { adminId: 'admin-1' };
    adminServiceMock.findOne.mockResolvedValue(response);

    const result = await controller.findOne('admin-1');

    expect(adminServiceMock.findOne).toHaveBeenCalledWith('admin-1');
    expect(result).toEqual(response);
  });

  it('should update admin by id', async () => {
    const dto = { name: 'Updated Name' } as any;
    const response = { adminId: 'admin-1', name: 'Updated Name' };
    adminServiceMock.update.mockResolvedValue(response);

    const result = await controller.update('admin-1', dto);

    expect(adminServiceMock.update).toHaveBeenCalledWith('admin-1', dto);
    expect(result).toEqual(response);
  });

  it('should remove admin by id', async () => {
    adminServiceMock.remove.mockResolvedValue(undefined);

    await controller.remove('admin-1');

    expect(adminServiceMock.remove).toHaveBeenCalledWith('admin-1');
  });
});
