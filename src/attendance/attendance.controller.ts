import { Body, Controller, Get, Param, Post, UseGuards } from "@nestjs/common";
import { AttendanceService } from "./attendance.service";
import { RolesGuard } from "src/roles/roles.guard";
import { CreateAttendanceDto } from "./dto/create-attendance.dto";
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiResponse } from "@nestjs/swagger";

@Controller('attendance')
export class AttendanceController {
  constructor(private readonly service: AttendanceService) {}

  @ApiOperation({ summary: 'Realiza checkin de uma criança' })
  @ApiBody({ type: CreateAttendanceDto })
  @ApiResponse({ status: 201, description: 'Checkin in realizado.' })
  @Post('checkin')
  @ApiBearerAuth()
  @UseGuards(RolesGuard('collaborator', 'companyAdmin', 'systemAdmin', 'master'))
  async doCheckin(@Body() createAttendanceDto: CreateAttendanceDto) {
    return this.service.doCheckin(createAttendanceDto);
  }

  @ApiOperation({ summary: 'Realiza checkout de uma criança' })
  @ApiBody({ type: CreateAttendanceDto })
  @ApiResponse({ status: 201, description: 'Checkout realizado.' })
  @Post('checkout')
  @ApiBearerAuth()
  @UseGuards(RolesGuard('collaborator', 'companyAdmin', 'systemAdmin', 'master'))
  async doCheckout(@Body() createAttendanceDto: CreateAttendanceDto) {
    return this.service.doCheckout(createAttendanceDto);
  }

  @ApiOperation({ summary: 'Obtém um registro de atendimento por ID' })
  @ApiParam({ name: 'id', type: String, description: 'ID do registro de atendimento' })
  @ApiResponse({ status: 200, description: 'Registro de atendimento obtido com sucesso.' })
  @Get(':id')
  @ApiBearerAuth()
  @UseGuards(RolesGuard('collaborator', 'companyAdmin', 'systemAdmin', 'master'))
  async getAttendance(@Param('id') id: string) {
    return this.service.getAttendance(id);
  }
}