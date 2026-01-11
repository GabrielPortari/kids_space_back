import { Controller, Post, Body, Param, Put, Delete, Request, UseGuards, Get, HttpCode } from '@nestjs/common';
import { CollaboratorService } from './collaborator.service';
import { CreateCollaboratorDto } from './dto/create-collaborator.dto';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiBody, ApiResponse } from '@nestjs/swagger';
import { RolesGuard } from 'src/roles/roles.guard';

@Controller('collaborator')
export class CollaboratorController {
  constructor(private readonly service: CollaboratorService,
  ) {}

  @Get(':id')
  @ApiOperation({ summary: 'Recupera colaborador por id' })
  @ApiParam({ name: 'id', description: 'Id do colaborador' })
  @ApiResponse({ status: 200, description: 'Colaborador retornado' })
  @ApiBearerAuth()
  @UseGuards(RolesGuard('master', 'systemAdmin', 'companyAdmin', 'collaborator'))
  async getCollaboratorById(@Param('id') id: string) {
    return this.service.getCollaboratorById(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualiza colaborador' })
  @ApiParam({ name: 'id', description: 'Id do colaborador' })
  @ApiBody({ type: CreateCollaboratorDto })
  @ApiResponse({ status: 200, description: 'Colaborador atualizado' })
  @ApiBearerAuth()
  @UseGuards(RolesGuard('master', 'systemAdmin', 'companyAdmin'))
  async updateCollaborator(@Param('id') id: string, @Body() createCollaboratorDto: CreateCollaboratorDto) {
    return this.service.updateCollaborator(id, createCollaboratorDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remove colaborador' })
  @ApiParam({ name: 'id', description: 'Id do colaborador' })
  @ApiResponse({ status: 204, description: 'Colaborador removido' })
  @ApiBearerAuth()
  @UseGuards(RolesGuard('master', 'systemAdmin', 'companyAdmin'))
  @HttpCode(204)
  async deleteCollaborator(@Param('id') id: string) {
    return this.service.deleteCollaborator(id);
  }
}
