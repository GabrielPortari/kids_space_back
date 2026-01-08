import { UserType } from "src/models/base-user.model";
import { IsString, IsOptional, IsEmail, MinLength, IsIn, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateAdminDto {
  @ApiProperty({ description: 'Tipo de admin', example: 'systemAdmin' })
  @IsString()
  @IsIn(['systemAdmin'])
  userType: UserType;

  @ApiPropertyOptional({ description: 'Status do admin', enum: ['active', 'inactive'], default: 'active' })
  @IsOptional()
  @IsIn(['active', 'inactive'])
  status?: 'active' | 'inactive';

  @ApiPropertyOptional({ description: 'Roles/Permissões do usuário', example: ['systemAdmin'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @IsIn(['systemAdmin'], { each: true })
  roles?: string[];

  @ApiPropertyOptional({ description: 'Nome completo' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ description: 'E-mail do admin', format: 'email' })
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ description: 'Telefone' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ description: 'Senha (mínimo 6 caracteres)', minLength: 6 })
  @IsString()
  @MinLength(6)
  password?: string;
}
