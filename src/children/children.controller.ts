import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards } from '@nestjs/common';
import { ChildrenService } from './children.service';
import { CreateChildDto } from './dto/create-child.dto';
import { ApiBearerAuth } from '@nestjs/swagger';
import { RolesGuard } from 'src/roles/roles.guard';
import { UpdateUserDto } from 'src/users/dto/update-user.dto';

@Controller('children')
export class ChildrenController {
  constructor(private readonly childrenService: ChildrenService) {}
  
  @Get(':id')
  @ApiBearerAuth()
  @UseGuards(RolesGuard('collaborator', 'companyAdmin', 'systemAdmin'))
  async getChildById(@Param('id') id: string) {
    return this.childrenService.getChildById(id);
  }

  @Put(':id')
  @ApiBearerAuth()
  @UseGuards(RolesGuard('collaborator', 'companyAdmin', 'systemAdmin'))
  async updateChild(@Param('id') id: string, @Body() updateChildDto: CreateChildDto) {
    return this.childrenService.updateChild(id, updateChildDto);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(RolesGuard('collaborator', 'companyAdmin', 'systemAdmin'))
  async deleteChild(@Param('id') id: string) {
    return this.childrenService.deleteChild(id);
  }
}
