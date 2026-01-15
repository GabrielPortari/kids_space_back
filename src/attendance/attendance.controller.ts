import { Body, Controller, Get, Param, Post, UseGuards } from "@nestjs/common";
import { AttendanceService } from "./attendance.service";
import { RolesGuard } from "src/roles/roles.guard";
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiResponse } from "@nestjs/swagger";
import { CreateCheckinDto } from "./dto/create-checkin.dto";
import { CreateCheckoutDto } from "./dto/create-checkout.dto";
import { IdToken } from "src/auth/dto/id-token.decorator";

@Controller('attendance')
export class AttendanceController {
  constructor(private readonly service: AttendanceService) {}

  @ApiOperation({ summary: 'Realiza checkin de uma criança' })
  @ApiBody({ type: CreateCheckinDto })
  @ApiResponse({ status: 201, description: 'Checkin realizado.' })
  @Post('checkin')
  @ApiBearerAuth()
  @UseGuards(RolesGuard('collaborator', 'companyAdmin', 'systemAdmin', 'master'))
  async doCheckin(@IdToken() idToken: string, @Body() createCheckinDto: CreateCheckinDto) {
    if (!idToken) throw new Error('Missing auth token');
    return this.service.doCheckin(createCheckinDto);
  }

  @ApiOperation({ summary: 'Realiza checkout de uma criança' })
  @ApiBody({ type: CreateCheckoutDto })
  @ApiResponse({ status: 201, description: 'Checkout realizado.' })
  @Post('checkout')
  @ApiBearerAuth()
  @UseGuards(RolesGuard('collaborator', 'companyAdmin', 'systemAdmin', 'master'))
  async doCheckout(@IdToken() idToken: string, @Body() createCheckoutDto: CreateCheckoutDto) {
    if (!idToken) throw new Error('Missing auth token');
    return this.service.doCheckout(createCheckoutDto);
  }

  @ApiOperation({ summary: 'Obtém um registro de atendimento por ID' })
  @ApiParam({ name: 'companyId', type: String, description: 'ID da empresa' })
  @ApiResponse({ status: 200, description: 'Registro de atendimento obtido com sucesso.' })
  @Get('company/:companyId')
  @ApiBearerAuth()
  @UseGuards(RolesGuard('collaborator', 'companyAdmin', 'systemAdmin', 'master'))
  async getAttendanceByCompanyId(@IdToken() idToken: string, @Param('companyId') companyId: string) {
    if (!idToken) throw new Error('Missing auth token');
    return this.service.getAttendancesByCompanyId(companyId);
  }

  @ApiOperation({ summary: 'Obtém o último checkin da empresa' })
  @ApiParam({ name: 'companyId', type: String, description: 'ID da empresa' })
  @ApiResponse({ status: 200, description: 'Último checkin obtido com sucesso.' })
  @Get('company/:companyId/last-checkin')
  @ApiBearerAuth()
  @UseGuards(RolesGuard('collaborator', 'companyAdmin', 'systemAdmin', 'master'))
  async getLastCheckin(@IdToken() idToken: string, @Param('companyId') companyId: string) {
    if (!idToken) throw new Error('Missing auth token');
    return this.service.getLastCheckin(companyId);
  }

  @ApiOperation({ summary: 'Obtém o último checkout da empresa' })
  @ApiParam({ name: 'companyId', type: String, description: 'ID da empresa' })
  @ApiResponse({ status: 200, description: 'Último checkout obtido com sucesso.' })
  @Get('company/:companyId/last-checkout')
  @ApiBearerAuth()
  @UseGuards(RolesGuard('collaborator', 'companyAdmin', 'systemAdmin', 'master'))
  async getLastCheckout(@IdToken() idToken: string, @Param('companyId') companyId: string) {
    if (!idToken) throw new Error('Missing auth token');
    return this.service.getLastCheckout(companyId);
  }

  @ApiOperation({ summary: 'Obtém os 30 últimos atendimentos da empresa' })
  @ApiParam({ name: 'companyId', type: String, description: 'ID da empresa' })
  @ApiResponse({ status: 200, description: 'Lista dos 30 últimos atendimentos' })
  @Get('company/:companyId/last-10')
  @ApiBearerAuth()
  @UseGuards(RolesGuard('collaborator', 'companyAdmin', 'systemAdmin', 'master'))
  async getLast10Attendances(@IdToken() idToken: string, @Param('companyId') companyId: string) {
    if (!idToken) throw new Error('Missing auth token');
    return this.service.getLast10Attendances(companyId);
  }

  @ApiOperation({ summary: 'Obtém checkins ativos (sem checkout) da empresa' })
  @ApiParam({ name: 'companyId', type: String, description: 'ID da empresa' })
  @ApiResponse({ status: 200, description: 'Lista de checkins ativos' })
  @Get('company/:companyId/active-checkins')
  @ApiBearerAuth()
  @UseGuards(RolesGuard('collaborator', 'companyAdmin', 'systemAdmin', 'master'))
  async getActiveCheckinsByCompanyId(@IdToken() idToken: string, @Param('companyId') companyId: string) {
    if (!idToken) throw new Error('Missing auth token');
    return this.service.getActiveCheckinsByCompanyId(companyId);
  }

  @ApiOperation({ summary: 'Obtém um registro de atendimento por ID' })
  @ApiParam({ name: 'id', type: String, description: 'ID do registro de atendimento' })
  @ApiResponse({ status: 200, description: 'Registro de atendimento obtido com sucesso.' })
  @Get(':id')
  @ApiBearerAuth()
  @UseGuards(RolesGuard('collaborator', 'companyAdmin', 'systemAdmin', 'master'))
  async getAttendanceById(@IdToken() idToken: string, @Param('id') id: string) {
    if (!idToken) throw new Error('Missing auth token');
    return this.service.getAttendanceById(id);
  }
}