import { UserType } from 'src/models/base-user.model';
import { IsOptional, IsString, IsEmail, IsDateString, IsArray, IsBoolean } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class CreateChildDto {
  @ApiPropertyOptional({ description: 'Tipo de usuário', example: 'child' })
  @IsOptional()
  @IsString()
  userType?: UserType;

  @ApiPropertyOptional({ description: 'URL da foto' })
  @IsOptional()
  @IsString()
  photoUrl?: string;

  @ApiPropertyOptional({ description: 'Nome completo' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: 'E-mail do usuário', format: 'email' })
  @IsOptional()
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

  @ApiPropertyOptional({ description: 'Documento (CPF etc.)' })
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
  
  @ApiPropertyOptional({ description: 'Status ativo' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
