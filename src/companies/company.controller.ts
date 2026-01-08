import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards } from '@nestjs/common';
import { CompanyService } from './company.service';
import { RolesGuard } from 'src/roles/roles.guard';
import { ApiBearerAuth } from '@nestjs/swagger';
import { CreateCompanyDto } from './dto/create-company.dto';
import { CreateCollaboratorDto } from 'src/collaborator/dto/create-collaborator.dto';

@Controller('company')
export class CompanyController {
  constructor(private readonly service: CompanyService) {}

  @Post('register')
  @ApiBearerAuth()
  @UseGuards(RolesGuard('master', 'systemAdmin'))
  async createCompany(@Body() createCompanyDto: CreateCompanyDto) {
    return this.service.createCompany(createCompanyDto);
  }

  @Post(':companyId/collaborator')
  @ApiBearerAuth()
  @UseGuards(RolesGuard('companyAdmin', 'systemAdmin', 'master'))
  async registerCollaborator(@Param('companyId') companyId: string, @Body() createCollaboratorDto: CreateCollaboratorDto) {
    return this.service.createCollaborator(companyId, createCollaboratorDto);
  }

  @Put(':id')
  @ApiBearerAuth()
  @UseGuards(RolesGuard('master', 'systemAdmin', 'companyAdmin'))
  async updateCompany(@Param('id') id: string, @Body() updateCompanyDto: CreateCompanyDto) {
    return this.service.updateCompany(id, updateCompanyDto);
  }

  @Get(':id')
  @ApiBearerAuth()
  @UseGuards(RolesGuard('master', 'systemAdmin'))
  async getCompanyById(@Param('id') id: string) {
    return this.service.getCompanyById(id);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(RolesGuard('master', 'systemAdmin'))
  async deleteCompany(@Param('id') id: string) {
    return this.service.deleteCompany(id);
  }
}
