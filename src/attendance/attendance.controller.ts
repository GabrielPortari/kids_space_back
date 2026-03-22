import {
  BadRequestException,
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Req,
  UseGuards,
  HttpCode,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AttendanceService } from './attendance.service';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { UpdateAttendanceDto } from './dto/update-attendance.dto';
import { Role } from '../constants/roles';
import { RolesGuard } from '../roles/roles.guard';
import { IdToken } from '../auth/dto/id-token.decorator';
import { FirebaseService } from '../firebase/firebase.service';
import { CheckoutAttendanceDto } from './dto/checkout-attendance.dto';
import { FindAttendancesQueryDto } from './dto/find-attendances-query.dto';
import { AttendanceOwnerOrCompanyGuard } from './guards/attendance-owner-or-company.guard';
import { UpdateAttendanceAdminDto } from './dto/update-attendance-admin.dto';

@Controller('v2/attendance')
export class AttendanceController {
  constructor(
    private readonly attendanceService: AttendanceService,
    private readonly firebaseService: FirebaseService,
  ) {}

  @Post('checkin')
  @UseGuards(RolesGuard(Role.COLLABORATOR, Role.COMPANY, Role.ADMIN))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Realiza check-in de crianca' })
  @ApiResponse({ status: 201, description: 'Check-in realizado com sucesso.' })
  @HttpCode(201)
  async checkIn(
    @IdToken() token: string,
    @Body() createAttendanceDto: CreateAttendanceDto,
    @Req() request: any,
  ) {
    if (!token) {
      throw new BadRequestException('id token is required');
    }

    const decoded = await this.firebaseService.verifyIdToken(token, true);
    const uid = decoded.uid;
    const actorCompanyId = (decoded as any).companyId || uid;
    const userRoles = [
      ...(Array.isArray(request?.user?.roles) ? request.user.roles : []),
      ...(request?.user?.role ? [request.user.role] : []),
    ];

    return this.attendanceService.checkIn(
      createAttendanceDto,
      actorCompanyId,
      uid,
      userRoles,
    );
  }

  @Post('checkout')
  @UseGuards(RolesGuard(Role.COLLABORATOR, Role.COMPANY, Role.ADMIN))
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Realiza checkout de crianca com confirmacao de CPF',
  })
  @ApiResponse({ status: 200, description: 'Checkout realizado com sucesso.' })
  @HttpCode(200)
  async checkOut(
    @IdToken() token: string,
    @Body() checkoutDto: CheckoutAttendanceDto,
    @Req() request: any,
  ) {
    if (!token) {
      throw new BadRequestException('id token is required');
    }

    const decoded = await this.firebaseService.verifyIdToken(token, true);
    const uid = decoded.uid;
    const actorCompanyId = (decoded as any).companyId || uid;
    const userRoles = [
      ...(Array.isArray(request?.user?.roles) ? request.user.roles : []),
      ...(request?.user?.role ? [request.user.role] : []),
    ];

    return this.attendanceService.checkOut(
      checkoutDto,
      actorCompanyId,
      uid,
      userRoles,
    );
  }

  @Get()
  @UseGuards(RolesGuard(Role.COLLABORATOR, Role.COMPANY, Role.ADMIN))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Lista atendimentos' })
  @ApiResponse({ status: 200, description: 'Lista de atendimentos retornada.' })
  async findAll(
    @IdToken() token: string,
    @Query() query: FindAttendancesQueryDto,
    @Req() request: any,
  ) {
    if (!token) {
      throw new BadRequestException('id token is required');
    }

    const decoded = await this.firebaseService.verifyIdToken(token, true);
    const uid = decoded.uid;
    const actorCompanyId = (decoded as any).companyId || uid;
    const userRoles = [
      ...(Array.isArray(request?.user?.roles) ? request.user.roles : []),
      ...(request?.user?.role ? [request.user.role] : []),
    ];

    return this.attendanceService.findAll(actorCompanyId, query, userRoles);
  }

  @Get(':attendanceId')
  @UseGuards(
    RolesGuard(Role.COLLABORATOR, Role.COMPANY, Role.ADMIN),
    AttendanceOwnerOrCompanyGuard,
  )
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Busca atendimento por ID' })
  @ApiResponse({ status: 200, description: 'Dados do atendimento retornados.' })
  findOne(@Param('attendanceId') attendanceId: string) {
    return this.attendanceService.findOne(attendanceId);
  }

  @Patch(':attendanceId')
  @UseGuards(
    RolesGuard(Role.COLLABORATOR, Role.COMPANY, Role.ADMIN),
    AttendanceOwnerOrCompanyGuard,
  )
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Atualiza atendimento por ID' })
  @ApiResponse({
    status: 200,
    description: 'Atendimento atualizado com sucesso.',
  })
  async update(
    @IdToken() token: string,
    @Param('attendanceId') attendanceId: string,
    @Body() updateAttendanceDto: UpdateAttendanceAdminDto,
    @Req() request: any,
  ) {
    if (!token) {
      throw new BadRequestException('id token is required');
    }

    const decoded = await this.firebaseService.verifyIdToken(token, true);
    const uid = decoded.uid;
    const actorCompanyId = (decoded as any).companyId || uid;
    const userRoles = [
      ...(Array.isArray(request?.user?.roles) ? request.user.roles : []),
      ...(request?.user?.role ? [request.user.role] : []),
    ];

    return this.attendanceService.update(
      attendanceId,
      updateAttendanceDto,
      actorCompanyId,
      userRoles,
    );
  }

  @Delete(':attendanceId')
  @UseGuards(
    RolesGuard(Role.COLLABORATOR, Role.COMPANY, Role.ADMIN),
    AttendanceOwnerOrCompanyGuard,
  )
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Remove atendimento por ID' })
  @ApiResponse({
    status: 204,
    description: 'Atendimento removido com sucesso.',
  })
  @HttpCode(204)
  async delete(
    @IdToken() token: string,
    @Param('attendanceId') attendanceId: string,
    @Req() request: any,
  ) {
    if (!token) {
      throw new BadRequestException('id token is required');
    }

    const decoded = await this.firebaseService.verifyIdToken(token, true);
    const uid = decoded.uid;
    const actorCompanyId = (decoded as any).companyId || uid;
    const userRoles = [
      ...(Array.isArray(request?.user?.roles) ? request.user.roles : []),
      ...(request?.user?.role ? [request.user.role] : []),
    ];

    return this.attendanceService.delete(
      attendanceId,
      actorCompanyId,
      userRoles,
    );
  }
}
