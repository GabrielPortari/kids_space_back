import { Body, Controller, Get, Param, Post, UseGuards } from "@nestjs/common";
import { AttendanceService } from "./attendance.service";
import { RolesGuard } from "src/roles/roles.guard";
import { CreateAttendanceDto } from "./dto/create-attendance.dto";
import { ApiBearerAuth } from "@nestjs/swagger";

@Controller('attendance')
export class AttendanceController {
  constructor(private readonly service: AttendanceService) {}

  @Post('checkin')
  @ApiBearerAuth()
  @UseGuards(RolesGuard('collaborator', 'companyAdmin', 'systemAdmin', 'master'))
  async doCheckin(@Body() createAttendanceDto: CreateAttendanceDto) {
    return this.service.doCheckin(createAttendanceDto);
  }

  @Post('checkout')
  @ApiBearerAuth()
  @UseGuards(RolesGuard('collaborator', 'companyAdmin', 'systemAdmin', 'master'))
  async doCheckout(@Body() createAttendanceDto: CreateAttendanceDto) {
    return this.service.doCheckout(createAttendanceDto);
  }

  @Get(':id')
  @ApiBearerAuth()
  @UseGuards(RolesGuard('collaborator', 'companyAdmin', 'systemAdmin', 'master'))
  async getAttendance(@Param('id') id: string) {
    return this.service.getAttendance(id);
  }
}