import { UserType } from 'src/models/base-user.model';
import {
  IsEmail,
  IsOptional,
  IsString,
  IsDateString,
  MinLength,
  IsIn,
  IsArray,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCollaboratorDto {
  @ApiPropertyOptional({ description: 'Tipo de colaborador', example: 'collaborator' })
  @IsOptional()
  @IsString()
  @IsIn(['collaborator', 'companyAdmin'])
  userType?: UserType;

  @ApiPropertyOptional({ description: 'Roles/Permissões do usuário', example: ['collaborator'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @IsIn(['collaborator', 'companyAdmin'], { each: true })
  roles?: string[];

  @ApiPropertyOptional({ description: 'URL da foto' })
  @IsOptional()
  @IsString()
  photoUrl?: string;

  @ApiPropertyOptional({ description: 'Nome completo' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ description: 'E-mail do usuário', format: 'email' })
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ description: 'Telefone de contato' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ description: 'Data de nascimento', format: 'date' })
  @IsOptional()
  @IsDateString()
  birthDate?: string;

  @ApiPropertyOptional({ description: 'Documento (CPF/CNPJ etc.)' })
  @IsOptional()
  @IsString()
  document?: string;

  @ApiPropertyOptional({ description: 'Endereço' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({ description: 'Número do endereço' })
  @IsOptional()
  @IsString()
  addressNumber?: string;

  @ApiPropertyOptional({ description: 'Complemento do endereço' })
  @IsOptional()
  @IsString()
  addressComplement?: string;

  @ApiPropertyOptional({ description: 'Bairro' })
  @IsOptional()
  @IsString()
  neighborhood?: string;

  @ApiPropertyOptional({ description: 'Cidade' })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional({ description: 'Estado' })
  @IsOptional()
  @IsString()
  state?: string;

  @ApiPropertyOptional({ description: 'CEP' })
  @IsOptional()
  @IsString()
  zipCode?: string;

  @ApiProperty({ description: 'ID da empresa' })
  @IsString()
  companyId?: string;

  @ApiProperty({ description: 'Senha (mínimo 6 caracteres)', minLength: 6 })
  @IsString()
  @MinLength(6)
  password?: string;
}
