import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { UpdateAttendanceDto } from './update-attendance.dto';

export class UpdateAttendanceAdminDto extends UpdateAttendanceDto {
  @ApiPropertyOptional({
    description: 'Company alvo da alteracao (opcional para admin)',
    example: 'company_123',
  })
  @IsOptional()
  @IsString()
  companyId?: string;
}
