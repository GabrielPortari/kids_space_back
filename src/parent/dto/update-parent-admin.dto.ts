import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { UpdateParentDto } from './update-parent.dto';

export class UpdateParentAdminDto extends UpdateParentDto {
  @ApiPropertyOptional({
    description: 'Parent alvo da alteracao (obrigatorio para admin)',
    example: 'parent_123',
  })
  @IsOptional()
  @IsString()
  companyId?: string;
}
