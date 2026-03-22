import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { AttendanceController } from './attendance.controller';
import { AttendanceService } from './attendance.service';
import { FirebaseService } from '../firebase/firebase.service';

describe('AttendanceController', () => {
  let controller: AttendanceController;
  const attendanceServiceMock = {
    checkIn: jest.fn(),
    checkOut: jest.fn(),
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
      controllers: [AttendanceController],
      providers: [
        { provide: AttendanceService, useValue: attendanceServiceMock },
        { provide: FirebaseService, useValue: firebaseServiceMock },
      ],
    }).compile();

    controller = module.get<AttendanceController>(AttendanceController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should throw when checkin token is missing', async () => {
    await expect(controller.checkIn('', {} as any, {})).rejects.toThrow(
      new BadRequestException('id token is required'),
    );
  });

  it('should call checkin with mapped actor context', async () => {
    const dto = { childId: 'child-1' } as any;
    firebaseServiceMock.verifyIdToken.mockResolvedValue({
      uid: 'uid-1',
      companyId: 'company-1',
    });

    await controller.checkIn('token', dto, { user: { role: 'collaborator' } });

    expect(attendanceServiceMock.checkIn).toHaveBeenCalledWith(
      dto,
      'company-1',
      'uid-1',
      ['collaborator'],
    );
  });

  it('should call checkout with uid fallback when no companyId claim', async () => {
    const dto = { childId: 'child-1', responsibleCpf: '12345678909' } as any;
    firebaseServiceMock.verifyIdToken.mockResolvedValue({ uid: 'uid-1' });

    await controller.checkOut('token', dto, { user: { roles: ['company'] } });

    expect(attendanceServiceMock.checkOut).toHaveBeenCalledWith(
      dto,
      'uid-1',
      'uid-1',
      ['company'],
    );
  });

  it('should proxy read/update/delete operations', async () => {
    firebaseServiceMock.verifyIdToken.mockResolvedValue({ uid: 'uid-1' });

    await controller.findAll('token', {} as any, { user: {} });
    await controller.findOne('att-1');
    await controller.update('token', 'att-1', { notes: 'ok' } as any, {
      user: { role: 'admin' },
    });
    await controller.delete('token', 'att-1', { user: { roles: ['admin'] } });

    expect(attendanceServiceMock.findAll).toHaveBeenCalled();
    expect(attendanceServiceMock.findOne).toHaveBeenCalledWith('att-1');
    expect(attendanceServiceMock.update).toHaveBeenCalled();
    expect(attendanceServiceMock.delete).toHaveBeenCalled();
  });
});
