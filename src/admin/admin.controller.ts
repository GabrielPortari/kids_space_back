import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  HttpCode,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { RolesGuard } from '../roles/roles.guard';
import { Role } from '../constants/roles';
import { FindAdminsQueryDto } from './dto/find-admins-query.dto';

@Controller('v2/admins')
@UseGuards(RolesGuard(Role.ADMIN))
@ApiBearerAuth()
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Post()
  @UseGuards(RolesGuard(Role.MASTER))
  @ApiOperation({ summary: 'Cria um novo admin' })
  @ApiResponse({ status: 201, description: 'Admin criado com sucesso.' })
  @HttpCode(201)
  create(@Body() createAdminDto: CreateAdminDto) {
    return this.adminService.create(createAdminDto);
  }

  @Get()
  @ApiOperation({ summary: 'Lista admins' })
  @ApiResponse({ status: 200, description: 'Lista de admins retornada.' })
  findAll(@Query() query: FindAdminsQueryDto) {
    return this.adminService.findAll(query);
  }

  @Get(':adminId')
  @ApiOperation({ summary: 'Busca admin por ID' })
  @ApiResponse({ status: 200, description: 'Admin retornado com sucesso.' })
  findOne(@Param('adminId') adminId: string) {
    return this.adminService.findOne(adminId);
  }

  @Patch(':adminId')
  @ApiOperation({ summary: 'Atualiza admin por ID' })
  @ApiResponse({ status: 200, description: 'Admin atualizado com sucesso.' })
  update(
    @Param('adminId') adminId: string,
    @Body() updateAdminDto: UpdateAdminDto,
  ) {
    return this.adminService.update(adminId, updateAdminDto);
  }

  @Delete(':adminId')
  @UseGuards(RolesGuard(Role.MASTER))
  @ApiOperation({ summary: 'Remove admin por ID' })
  @ApiResponse({ status: 204, description: 'Admin removido com sucesso.' })
  @HttpCode(204)
  remove(@Param('adminId') adminId: string) {
    return this.adminService.remove(adminId);
  }
}
