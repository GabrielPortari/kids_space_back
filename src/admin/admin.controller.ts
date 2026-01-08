import { Body, Controller, Post, Delete, Param, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { CreateAdminDto } from './dto/create-admin.dto';
import { ApiBearerAuth } from '@nestjs/swagger';
import { RolesGuard } from 'src/roles/roles.guard';

@Controller('admin')
export class AdminController {
  constructor(private readonly service: AdminService) {}

  @Post('register')
  @ApiBearerAuth()
  @UseGuards(RolesGuard('master'))
  async registerSystemAdmin(@Body() createAdminDto: CreateAdminDto) {
    return this.service.registerSystemAdmin(createAdminDto);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(RolesGuard('master'))
  async deleteSystemAdmin(@Param('id') id: string) {
    return this.service.deleteSystemAdmin(id);
  }
}
