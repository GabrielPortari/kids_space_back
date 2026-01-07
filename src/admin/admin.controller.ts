import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { CreateAdminDto } from './dto/create-admin.dto';
import { ApiBearerAuth } from '@nestjs/swagger';
import { RolesGuard } from 'src/roles/roles.guard';

@Controller('admin')
export class AdminController {
  constructor(private readonly service: AdminService) {}

  @Post('register')
  @ApiBearerAuth()
  @UseGuards(RolesGuard('companyAdmin', 'systemAdmin'))
  async registerSystemAdmin(@Body() createAdminDto: CreateAdminDto) {
    return this.service.registerSystemAdmin(createAdminDto);
  }
  
}
