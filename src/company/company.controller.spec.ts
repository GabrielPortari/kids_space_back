import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { CompanyController } from './company.controller';
import { CompanyService } from './company.service';
import { FirebaseService } from '../firebase/firebase.service';

describe('CompanyController', () => {
  let controller: CompanyController;
  const companyServiceMock = {
    findOne: jest.fn(),
    updateMe: jest.fn(),
    findAll: jest.fn(),
    updateByActor: jest.fn(),
  };
  const firebaseServiceMock = {
    verifyIdToken: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CompanyController],
      providers: [
        { provide: CompanyService, useValue: companyServiceMock },
        { provide: FirebaseService, useValue: firebaseServiceMock },
      ],
    }).compile();

    controller = module.get<CompanyController>(CompanyController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should throw when findMe is called without token', async () => {
    await expect(controller.findMe('')).rejects.toThrow(
      new BadRequestException('id token is required'),
    );
  });

  it('should resolve findMe using decoded uid', async () => {
    firebaseServiceMock.verifyIdToken.mockResolvedValue({ uid: 'company-1' });
    companyServiceMock.findOne.mockResolvedValue({ companyId: 'company-1' });

    const result = await controller.findMe('token');

    expect(firebaseServiceMock.verifyIdToken).toHaveBeenCalledWith(
      'token',
      true,
    );
    expect(companyServiceMock.findOne).toHaveBeenCalledWith('company-1');
    expect(result).toEqual({ companyId: 'company-1' });
  });

  it('should update authenticated company by uid', async () => {
    const dto = { name: 'New Name' } as any;
    firebaseServiceMock.verifyIdToken.mockResolvedValue({ uid: 'company-1' });
    companyServiceMock.updateMe.mockResolvedValue({ companyId: 'company-1' });

    const result = await controller.updateMe('token', dto);

    expect(companyServiceMock.updateMe).toHaveBeenCalledWith('company-1', dto);
    expect(result).toEqual({ companyId: 'company-1' });
  });

  it('should list companies', async () => {
    const query = { page: 1, limit: 10 } as any;
    const response = { items: [{ companyId: 'company-1' }] };
    companyServiceMock.findAll.mockResolvedValue(response);

    const result = await controller.findAll(query);

    expect(companyServiceMock.findAll).toHaveBeenCalledWith(query);
    expect(result).toEqual(response);
  });

  it('should update company by actor roles', async () => {
    const request = {
      user: {
        roles: ['admin'],
        role: 'systemAdmin',
      },
    };
    const dto = { status: 'active' } as any;

    await controller.updateByCompanyId(request, 'company-1', dto);

    expect(companyServiceMock.updateByActor).toHaveBeenCalledWith(
      'company-1',
      dto,
      ['admin', 'systemAdmin'],
    );
  });
});
