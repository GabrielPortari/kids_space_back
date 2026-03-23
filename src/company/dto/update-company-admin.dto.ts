import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString, Matches } from 'class-validator';
import { UpdateCompanyDto } from './update-company.dto';

export class UpdateCompanyAdminDto extends UpdateCompanyDto {
  @ApiPropertyOptional({
    description: 'Company alvo da alteracao (obrigatorio para admin)',
    example: 'company_123',
  })
  @IsOptional()
  @IsString()
  companyId?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  active?: boolean;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  verified?: boolean;

  @ApiPropertyOptional({
    example: '12345678000195',
    description: 'CNPJ com 14 digitos numericos',
  })
  @IsOptional()
  @IsString()
  @Matches(/^\d{14}$/, { message: 'cnpj deve conter 14 digitos numericos' })
  cnpj?: string;
}
