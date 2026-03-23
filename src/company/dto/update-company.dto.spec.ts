import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { UpdateCompanyDto } from './update-company.dto';

describe('UpdateCompanyDto', () => {
  it('rejects active in public update payload', async () => {
    const dto = plainToInstance(UpdateCompanyDto, {
      name: 'Novo Nome',
      active: true,
    });

    const errors = await validate(dto, {
      whitelist: true,
      forbidNonWhitelisted: true,
    });

    expect(errors.some((e) => e.property === 'active')).toBe(true);
  });

  it('rejects verified in public update payload', async () => {
    const dto = plainToInstance(UpdateCompanyDto, {
      legalName: 'Empresa LTDA',
      verified: true,
    });

    const errors = await validate(dto, {
      whitelist: true,
      forbidNonWhitelisted: true,
    });

    expect(errors.some((e) => e.property === 'verified')).toBe(true);
  });
});
