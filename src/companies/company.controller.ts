import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards, HttpCode } from '@nestjs/common';
import { CompanyService } from './company.service';
import { RolesGuard } from 'src/roles/roles.guard';
import { ApiBearerAuth, ApiOperation, ApiBody, ApiParam, ApiResponse } from '@nestjs/swagger';
import { CreateCompanyDto } from './dto/create-company.dto';
import { CreateCollaboratorDto } from 'src/collaborator/dto/create-collaborator.dto';

@Controller('company')
export class CompanyController {
  constructor(private readonly service: CompanyService) {}

  @Post('register')
  @ApiOperation({ summary: 'Registra nova empresa' })
  @ApiBody({ type: CreateCompanyDto })
  @ApiResponse({ status: 201, description: 'Empresa criada' })
  @ApiBearerAuth()
  @UseGuards(RolesGuard('master', 'systemAdmin'))
  @HttpCode(201)
  async createCompany(@Body() createCompanyDto: CreateCompanyDto) {
    return this.service.createCompany(createCompanyDto);
  }

  @Post(':companyId/collaborator')
  @ApiOperation({ summary: 'Registra colaborador para a empresa' })
  @ApiParam({ name: 'companyId', description: 'Id da empresa' })
  @ApiBody({ type: CreateCollaboratorDto })
  @ApiResponse({ status: 201, description: 'Colaborador registrado' })
  @ApiBearerAuth()
  @UseGuards(RolesGuard('companyAdmin', 'systemAdmin', 'master'))
  @HttpCode(201)
  async registerCollaborator(@Param('companyId') companyId: string, @Body() createCollaboratorDto: CreateCollaboratorDto) {
    return this.service.createCollaborator(companyId, createCollaboratorDto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualiza empresa' })
  @ApiParam({ name: 'id', description: 'Id da empresa' })
  @ApiBody({ type: CreateCompanyDto })
  @ApiResponse({ status: 200, description: 'Empresa atualizada' })
  @ApiBearerAuth()
  @UseGuards(RolesGuard('master', 'systemAdmin', 'companyAdmin'))
  async updateCompany(@Param('id') id: string, @Body() updateCompanyDto: CreateCompanyDto) {
    return this.service.updateCompany(id, updateCompanyDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Recupera empresa por id' })
  @ApiParam({ name: 'id', description: 'Id da empresa' })
  @ApiResponse({ status: 200, description: 'Empresa retornada' })
  @ApiBearerAuth()
  @UseGuards(RolesGuard('master', 'systemAdmin'))
  async getCompanyById(@Param('id') id: string) {
    return this.service.getCompanyById(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remove empresa' })
  @ApiParam({ name: 'id', description: 'Id da empresa' })
  @ApiResponse({ status: 204, description: 'Empresa removida' })
  @ApiBearerAuth()
  @UseGuards(RolesGuard('master', 'systemAdmin'))
  @HttpCode(204)
  async deleteCompany(@Param('id') id: string) {
    return this.service.deleteCompany(id);
  }
}
