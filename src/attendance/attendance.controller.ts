import { Body, Controller, Get, Param, Post, UseGuards } from "@nestjs/common";
import { AttendanceService } from "./attendance.service";
import { RolesGuard } from "src/roles/roles.guard";
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiResponse } from "@nestjs/swagger";
import { CreateCheckinDto } from "./dto/create-checkin.dto";
import { CreateCheckoutDto } from "./dto/create-checkout.dto";

@Controller('attendance')
export class AttendanceController {
  constructor(private readonly service: AttendanceService) {}

  @ApiOperation({ summary: 'Realiza checkin de uma criança' })
  @ApiBody({ type: CreateCheckinDto })
  @ApiResponse({ status: 201, description: 'Checkin realizado.' })
  @Post('checkin')
  @ApiBearerAuth()
  @UseGuards(RolesGuard('collaborator', 'companyAdmin', 'systemAdmin', 'master'))
  async doCheckin(@Body() createCheckinDto: CreateCheckinDto) {
    return this.service.doCheckin(createCheckinDto);
  }

  @ApiOperation({ summary: 'Realiza checkout de uma criança' })
  @ApiBody({ type: CreateCheckoutDto })
  @ApiResponse({ status: 201, description: 'Checkout realizado.' })
  @Post('checkout')
  @ApiBearerAuth()
  @UseGuards(RolesGuard('collaborator', 'companyAdmin', 'systemAdmin', 'master'))
  async doCheckout(@Body() createCheckoutDto: CreateCheckoutDto) {
    return this.service.doCheckout(createCheckoutDto);
  }

  @ApiOperation({ summary: 'Obtém um registro de atendimento por ID' })
  @ApiParam({ name: 'id', type: String, description: 'ID do registro de atendimento' })
  @ApiResponse({ status: 200, description: 'Registro de atendimento obtido com sucesso.' })
  @Get(':id')
  @ApiBearerAuth()
  @UseGuards(RolesGuard('collaborator', 'companyAdmin', 'systemAdmin', 'master'))
  async getAttendanceById(@Param('id') id: string) {
    return this.service.getAttendanceById(id);
  }
}