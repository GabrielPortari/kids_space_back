import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { RolesGuard } from './roles.guard';

@Controller('roles')
export class RolesController {
  @Get('collaborator')
  @ApiOperation({ summary: 'Endpoint para colaboradores' })
  @ApiResponse({ status: 200, description: 'Acesso de colaborador' })
  @UseGuards(RolesGuard('collaborator', 'company', 'admin'))
  @ApiBearerAuth()
  collaborator() {
    return 'If you can see this, you have the collaborator role';
  }

  @Get('company')
  @ApiOperation({ summary: 'Endpoint para administradores de empresa' })
  @ApiResponse({ status: 200, description: 'Acesso de company' })
  @UseGuards(RolesGuard('company', 'admin'))
  @ApiBearerAuth()
  companyAdmin() {
    return 'If you can see this, you have the company role';
  }

  @Get('admin')
  @ApiOperation({ summary: 'Endpoint para administradores do sistema' })
  @ApiResponse({ status: 200, description: 'Acesso de admin' })
  @UseGuards(RolesGuard('admin'))
  @ApiBearerAuth()
  systemAdmin() {
    return 'If you can see this, you have the admin role';
  }
}
