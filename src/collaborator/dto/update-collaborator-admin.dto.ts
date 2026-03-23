import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { UpdateCollaboratorDto } from './update-collaborator.dto';

export class UpdateCollaboratorAdminDto extends UpdateCollaboratorDto {
  @ApiPropertyOptional({
    description: 'Collaborator alvo da alteracao (obrigatorio para admin)',
    example: 'collaborator_123',
  })
  @IsOptional()
  @IsString()
  companyId?: string;
}
