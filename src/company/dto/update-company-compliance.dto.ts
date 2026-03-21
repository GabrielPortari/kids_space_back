import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateCompanyComplianceDto {
  @ApiPropertyOptional({
    example: true,
    description: 'Ativa/desativa o company (apenas admin)',
  })
  @IsOptional()
  @IsBoolean()
  active?: boolean;

  @ApiPropertyOptional({
    example: true,
    description: 'Marca company como verificado (apenas admin)',
  })
  @IsOptional()
  @IsBoolean()
  verified?: boolean;
}
