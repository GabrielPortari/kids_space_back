import { Controller, Post, Body, UseGuards, Get, Param, Put, Delete } from '@nestjs/common';
import { AdminService } from './admin.service';
import { FirebaseAuthGuard } from 'src/auth/firebase-auth.guard';
import { CreateAdminDto } from './dto/create-admin.dto';

@Controller('admin')
export class AdminController {
  constructor(private readonly service: AdminService) {}
 
  @UseGuards(FirebaseAuthGuard)
  @Get('protected')
  adminOnly() {return {ok: true}; }

  @UseGuards(FirebaseAuthGuard)
  @Post('register')
  async register(@Body() dto: CreateAdminDto){
    return this.service.register(dto);
  }
}
