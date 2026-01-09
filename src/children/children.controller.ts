import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards, HttpCode } from '@nestjs/common';
import { ChildrenService } from './children.service';
import { CreateChildDto } from './dto/create-child.dto';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiBody, ApiResponse } from '@nestjs/swagger';
import { RolesGuard } from 'src/roles/roles.guard';
import { UpdateUserDto } from 'src/users/dto/update-user.dto';

@Controller('children')
export class ChildrenController {
  constructor(private readonly childrenService: ChildrenService) {}
  
  @Get(':id')
  @ApiOperation({ summary: 'Recupera uma criança por id' })
  @ApiParam({ name: 'id', description: 'Id da criança' })
  @ApiResponse({ status: 200, description: 'Criança retornada' })
  @ApiBearerAuth()
  @UseGuards(RolesGuard('collaborator', 'companyAdmin', 'systemAdmin'))
  async getChildById(@Param('id') id: string) {
    return this.childrenService.getChildById(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualiza dados da criança' })
  @ApiParam({ name: 'id', description: 'Id da criança' })
  @ApiBody({ type: CreateChildDto })
  @ApiResponse({ status: 200, description: 'Criança atualizada' })
  @ApiBearerAuth()
  @UseGuards(RolesGuard('collaborator', 'companyAdmin', 'systemAdmin'))
  async updateChild(@Param('id') id: string, @Body() updateChildDto: CreateChildDto) {
    return this.childrenService.updateChild(id, updateChildDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remove uma criança' })
  @ApiParam({ name: 'id', description: 'Id da criança' })
  @ApiResponse({ status: 204, description: 'Criança removida' })
  @ApiBearerAuth()
  @UseGuards(RolesGuard('collaborator', 'companyAdmin', 'systemAdmin'))
  @HttpCode(204)
  async deleteChild(@Param('id') id: string) {
    return this.childrenService.deleteChild(id);
  }
}
