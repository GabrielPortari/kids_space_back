import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class FindCollaboratorsQueryDto {
  @ApiPropertyOptional({
    description: 'Filtra por companyId especifico',
    example: 'company_123',
  })
  @IsOptional()
  @IsString()
  companyId?: string;

  @ApiPropertyOptional({ description: 'Filtra por nome (contains)' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: 'Filtra por email' })
  @IsOptional()
  @IsString()
  email?: string;

  @ApiPropertyOptional({ description: 'Filtra por document (CPF/CNPJ)' })
  @IsOptional()
  @IsString()
  document?: string;
}
