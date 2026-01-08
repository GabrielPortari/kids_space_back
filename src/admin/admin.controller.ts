import { Body, Controller, Post, Delete, Param, UseGuards, Get, Put } from '@nestjs/common';
import { AdminService } from './admin.service';
import { CreateAdminDto } from './dto/create-admin.dto';
import { ApiBearerAuth, ApiResponse, ApiBody, ApiParam, ApiOperation } from '@nestjs/swagger';
import { RolesGuard } from 'src/roles/roles.guard';
import { UpdateAdminDto } from './dto/update-admin.dto';

@Controller('admin')
export class AdminController {
  constructor(private readonly service: AdminService) {}

  @ApiOperation({ summary: 'Cria um novo administrador' })
  @ApiParam({ name: 'id', type: Number })
  @ApiBody({ type: CreateAdminDto })
  @ApiResponse({ status: 201, description: 'Administrador criado.' })
  @Post('register')
  @ApiBearerAuth()
  @UseGuards(RolesGuard('master'))
  async registerSystemAdmin(@Body() createAdminDto: CreateAdminDto) {
    return this.service.registerSystemAdmin(createAdminDto);
  }

  @ApiOperation({ summary: 'Obtém um administrador pelo ID' })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 200, description: 'Administrador encontrado.' })
  @Get(':id')
  @ApiBearerAuth()
  @UseGuards(RolesGuard('master'))
  async getAdminById(@Param('id') id: string) {
    return this.service.getAdminById(id);
  }

  @ApiOperation({ summary: 'Atualiza um administrador pelo ID' })
  @ApiParam({ name: 'id', type: String })
  @ApiBody({ type: CreateAdminDto })
  @ApiResponse({ status: 200, description: 'Administrador atualizado.' })
  @Put(':id')
  @ApiBearerAuth()
  @UseGuards(RolesGuard('master'))
  async updateAdmin(@Param('id') id: string, @Body() createAdminDto: CreateAdminDto) {
    return this.service.updateSystemAdmin(id, createAdminDto);
  }

  @ApiOperation({ summary: 'Deleta um administrador pelo ID' })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 200, description: 'Administrador deletado.' })
  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(RolesGuard('master'))
  async deleteSystemAdmin(@Param('id') id: string) {
    return this.service.deleteSystemAdmin(id);
  }
}
