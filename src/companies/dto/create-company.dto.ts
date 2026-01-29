import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  IsEmail,
  IsUrl,
  IsPhoneNumber,
  IsPostalCode,
  IsInt,
  IsObject,
  IsArray,
  IsIn,
} from 'class-validator';

export class CreateCompanyDto {
  @ApiPropertyOptional({ description: 'Nome fantasia' })
  @IsOptional()
  @IsString()
  fantasyName?: string;


  @ApiPropertyOptional({ description: 'Razão social / corporate name' })
  @IsOptional()
  @IsString()
  corporateName?: string;

  @ApiPropertyOptional({ description: 'CNPJ' })
  @IsOptional()
  @IsString()
  cnpj?: string;

  @ApiPropertyOptional({ description: 'Website da empresa' })
  @IsOptional()
  @IsUrl()
  website?: string;

  @ApiPropertyOptional({ description: 'Logradouro / endereço' })
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
  @IsPostalCode('BR')
  zipCode?: string;

  @ApiPropertyOptional({ description: 'Telefone de contato' })
  @IsOptional()
  @IsPhoneNumber('BR')
  phone?: string;

  @ApiPropertyOptional({ description: 'E-mail de contato' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ description: 'URL do logo' })
  @IsOptional()
  @IsUrl()
  logoUrl?: string;

  @ApiPropertyOptional({ description: 'Responsável (objeto BaseUser)' })
  @IsOptional()
  @IsObject()
  responsible?: any;

  @ApiPropertyOptional({ description: 'Roles do responsável (ex: ["companyAdmin"])' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @IsIn(['collaborator', 'companyAdmin'], { each: true })
  responsibleRoles?: string[];

  @ApiPropertyOptional({ description: 'User type do responsável', enum: ['collaborator', 'companyAdmin'] })
  @IsOptional()
  @IsString()
  @IsIn(['collaborator', 'companyAdmin'])
  responsibleUserType?: 'collaborator' | 'companyAdmin';

  @ApiPropertyOptional({ description: 'ID do responsável já existente (alternativa ao objeto responsible)' })
  @IsOptional()
  @IsString()
  responsibleId?: string;

  @ApiPropertyOptional({ description: 'Número de colaboradores' })
  @IsOptional()
  @IsInt()
  collaborators?: number;

  @ApiPropertyOptional({ description: 'Número de usuários' })
  @IsOptional()
  @IsInt()
  users?: number;

  @ApiPropertyOptional({ description: 'Número de crianças' })
  @IsOptional()
  @IsInt()
  children?: number;
}
