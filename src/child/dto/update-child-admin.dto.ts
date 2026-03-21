import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { UpdateChildDto } from './update-child.dto';

export class UpdateChildAdminDto extends UpdateChildDto {
  @ApiPropertyOptional({
    description: 'Company alvo da alteracao (opcional para admin)',
    example: 'company_123',
  })
  @IsOptional()
  @IsString()
  companyId?: string;
}
