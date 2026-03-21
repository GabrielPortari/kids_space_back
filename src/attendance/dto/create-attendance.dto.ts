import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsNotEmpty } from 'class-validator';

export class CreateAttendanceDto {
  @ApiProperty({ description: 'ID da crianca para check-in' })
  @IsString()
  @IsNotEmpty()
  childId: string;

  @ApiPropertyOptional({ description: 'ID do responsavel no check-in' })
  @IsOptional()
  @IsString()
  responsibleIdWhoCheckedInId?: string;

  @ApiPropertyOptional({ description: 'Observacoes do atendimento' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({
    description: 'Company alvo (obrigatorio para admin)',
    example: 'company_123',
  })
  @IsOptional()
  @IsString()
  companyId?: string;
}
