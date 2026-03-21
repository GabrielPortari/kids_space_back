import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class FindAttendancesQueryDto {
  @ApiPropertyOptional({ description: 'Filtra por companyId (admin)' })
  @IsOptional()
  @IsString()
  companyId?: string;

  @ApiPropertyOptional({ description: 'Filtra por childId' })
  @IsOptional()
  @IsString()
  childId?: string;

  @ApiPropertyOptional({ description: 'Filtra por collaboratorId' })
  @IsOptional()
  @IsString()
  collaboratorId?: string;

  @ApiPropertyOptional({
    description: 'Somente check-ins ativos (sem checkout)',
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  activeOnly?: boolean;

  @ApiPropertyOptional({ description: 'Data inicial (ISO)' })
  @IsOptional()
  @IsString()
  from?: string;

  @ApiPropertyOptional({ description: 'Data final (ISO)' })
  @IsOptional()
  @IsString()
  to?: string;
}
