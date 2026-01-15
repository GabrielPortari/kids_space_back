import { Controller, Get, Body, Param, Put, Delete, UseGuards, HttpCode, ForbiddenException } from '@nestjs/common';
import { ChildrenService } from './children.service';
import { CreateChildDto } from './dto/create-child.dto';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiBody, ApiResponse } from '@nestjs/swagger';
import { RolesGuard } from 'src/roles/roles.guard';
import { IdToken } from 'src/auth/dto/id-token.decorator';

@Controller('child')
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

  @Get('/company/:companyId')
  @ApiOperation({ summary: 'Recupera crianças de uma empresa' })
  @ApiParam({ name: 'companyId', description: 'Id da empresa' })
  @ApiResponse({ status: 200, description: 'Crianças retornadas' })
  @ApiBearerAuth()
  @UseGuards(RolesGuard('collaborator', 'companyAdmin', 'systemAdmin'))
  async getChildByCompanyId(@IdToken() token: string, @Param('companyId') companyId?: string) {
    if (!token) throw new ForbiddenException('Missing auth token');

    return this.childrenService.getChildByCompanyId(companyId);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualiza dados da criança' })
  @ApiParam({ name: 'id', description: 'Id da criança' })
  @ApiBody({ type: CreateChildDto })
  @ApiResponse({ status: 200, description: 'Criança atualizada' })
  @ApiBearerAuth()
  @UseGuards(RolesGuard('collaborator', 'companyAdmin', 'systemAdmin'))
  async updateChild(@IdToken() token: string, @Param('id') id: string, @Body() updateChildDto: CreateChildDto) {
    if (!token) throw new ForbiddenException('Missing auth token');
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
