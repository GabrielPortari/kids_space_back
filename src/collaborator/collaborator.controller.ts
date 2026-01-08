import { Controller, Post, Body, Param, Put, Delete, Request, UseGuards, Get } from '@nestjs/common';
import { CollaboratorService } from './collaborator.service';
import { CreateCollaboratorDto } from './dto/create-collaborator.dto';
import { ApiBearerAuth } from '@nestjs/swagger';
import { RolesGuard } from 'src/roles/roles.guard';

@Controller('collaborator')
export class CollaboratorController {
  constructor(private readonly service: CollaboratorService,
  ) {}

  @Get(':id')
  @ApiBearerAuth()
  @UseGuards(RolesGuard('master', 'systemAdmin', 'companyAdmin'))
  async getCollaboratorById(@Param('id') id: string) {
    return this.service.getCollaboratorById(id);
  }

  @Put(':id')
  @ApiBearerAuth()
  @UseGuards(RolesGuard('master', 'systemAdmin', 'companyAdmin'))
  async updateCollaborator(@Param('id') id: string, @Body() updateCollaboratorDto: CreateCollaboratorDto) {
    return this.service.updateCollaborator(id, updateCollaboratorDto);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(RolesGuard('master', 'systemAdmin', 'companyAdmin'))
  async deleteCollaborator(@Param('id') id: string) {
    return this.service.deleteCollaborator(id);
  }
}
