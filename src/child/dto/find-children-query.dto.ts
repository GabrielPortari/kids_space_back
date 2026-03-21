import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class FindChildrenQueryDto {
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

  @ApiPropertyOptional({ description: 'Filtra por email (contains)' })
  @IsOptional()
  @IsString()
  email?: string;

  @ApiPropertyOptional({ description: 'Filtra por documento (contains)' })
  @IsOptional()
  @IsString()
  document?: string;

  @ApiPropertyOptional({ description: 'Filtra por parentId associado' })
  @IsOptional()
  @IsString()
  parentId?: string;
}
