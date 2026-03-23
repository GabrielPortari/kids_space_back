import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CheckoutAttendanceDto {
  @ApiProperty({ description: 'ID da crianca para checkout' })
  @IsString()
  @IsNotEmpty()
  childId: string;

  @ApiProperty({
    description: 'CPF do responsavel para confirmar checkout',
    example: '12345678900',
  })
  @IsString()
  @IsNotEmpty()
  responsibleDocument: string;

  @ApiPropertyOptional({ description: 'Observacoes no checkout' })
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
