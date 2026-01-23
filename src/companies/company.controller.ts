import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards, HttpCode } from '@nestjs/common';
import { CompanyService } from './company.service';
import { RolesGuard } from 'src/roles/roles.guard';
import { ApiBearerAuth, ApiOperation, ApiBody, ApiParam, ApiResponse } from '@nestjs/swagger';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { CreateCollaboratorDto } from 'src/collaborator/dto/create-collaborator.dto';

@Controller('companies')
export class CompanyController {
  constructor(private readonly service: CompanyService) {}

  @Post()
  @ApiOperation({ summary: 'Registra nova empresa' })
  @ApiBody({ type: CreateCompanyDto })
  @ApiResponse({ status: 201, description: 'Empresa criada' })
  @ApiBearerAuth()
  @UseGuards(RolesGuard('master', 'systemAdmin'))
  @HttpCode(201)
  async createCompany(@Body() createCompanyDto: CreateCompanyDto) {
    return this.service.createCompany(createCompanyDto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualiza empresa' })
  @ApiParam({ name: 'id', description: 'Id da empresa' })
  @ApiBody({ type: UpdateCompanyDto })
  @ApiResponse({ status: 200, description: 'Empresa atualizada' })
  @ApiBearerAuth()
  @UseGuards(RolesGuard('master', 'systemAdmin', 'companyAdmin'))
  async updateCompany(@Param('id') id: string, @Body() updateCompanyDto: UpdateCompanyDto) {
    return this.service.updateCompany(id, updateCompanyDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Recupera empresa por id' })
  @ApiParam({ name: 'id', description: 'Id da empresa' })
  @ApiResponse({ status: 200, description: 'Empresa retornada' })
  @ApiBearerAuth()
  @UseGuards(RolesGuard('master', 'systemAdmin', 'companyAdmin', 'collaborator'))
  async getCompanyById(@Param('id') id: string) {
    return this.service.getCompanyById(id);
  }

  @Get()
  @ApiOperation({ summary: 'Recupera todas as empresas' })
  @ApiResponse({ status: 200, description: 'Empresas retornadas' })
  async getAllCompany() {
    return this.service.getAllCompanies();
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
