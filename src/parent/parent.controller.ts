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
import { ParentService } from './parent.service';
import { CreateParentDto } from './dto/create-parent.dto';
import { Role } from '../constants/roles';
import { RolesGuard } from '../roles/roles.guard';
import { IdToken } from '../auth/dto/id-token.decorator';
import { FirebaseService } from '../firebase/firebase.service';
import { UpdateParentAdminDto } from './dto/update-parent-admin.dto';
import { FindParentsQueryDto } from './dto/find-parents-query.dto';
import { ParentOwnerOrCompanyGuard } from './guards/parent-owner-or-company.guard';

@Controller('v2/parents')
export class ParentController {
  constructor(
    private readonly parentService: ParentService,
    private readonly firebaseService: FirebaseService,
  ) {}

  @Post()
  @UseGuards(RolesGuard(Role.COLLABORATOR, Role.COMPANY, Role.ADMIN))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cria um novo parent/responsavel' })
  @ApiResponse({ status: 201, description: 'Parent criado com sucesso.' })
  @HttpCode(201)
  async create(
    @IdToken() token: string,
    @Body() createParentDto: CreateParentDto,
    @Req() request: any,
  ) {
    if (!token) {
      throw new BadRequestException('id token is required');
    }

    const { uid } = await this.firebaseService.verifyIdToken(token, true);

    const userRoles = [
      ...(Array.isArray(request?.user?.roles) ? request.user.roles : []),
      ...(request?.user?.role ? [request.user.role] : []),
    ];

    return this.parentService.create(createParentDto, uid, userRoles);
  }

  @Get()
  @UseGuards(RolesGuard(Role.COLLABORATOR, Role.COMPANY, Role.ADMIN))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Lista parents/responsaveis' })
  @ApiResponse({ status: 200, description: 'Lista de parents retornada.' })
  async findAll(
    @IdToken() token: string,
    @Query() query: FindParentsQueryDto,
    @Req() request: any,
  ) {
    if (!token) {
      throw new BadRequestException('id token is required');
    }

    const { uid } = await this.firebaseService.verifyIdToken(token, true);

    const userRoles = [
      ...(Array.isArray(request?.user?.roles) ? request.user.roles : []),
      ...(request?.user?.role ? [request.user.role] : []),
    ];

    return this.parentService.findAll(uid, query, userRoles);
  }

  @Get(':parentId')
  @UseGuards(
    RolesGuard(Role.COLLABORATOR, Role.COMPANY, Role.ADMIN),
    ParentOwnerOrCompanyGuard,
  )
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtem um parent por ID' })
  @ApiResponse({ status: 200, description: 'Dados do parent retornados.' })
  findOne(@Param('parentId') parentId: string) {
    return this.parentService.findOne(parentId);
  }

  @Patch(':parentId')
  @UseGuards(
    RolesGuard(Role.COLLABORATOR, Role.COMPANY, Role.ADMIN),
    ParentOwnerOrCompanyGuard,
  )
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Atualiza um parent' })
  @ApiResponse({ status: 200, description: 'Parent atualizado com sucesso.' })
  async update(
    @IdToken() token: string,
    @Param('parentId') parentId: string,
    @Body() updateParentDto: UpdateParentAdminDto,
    @Req() request: any,
  ) {
    if (!token) {
      throw new BadRequestException('id token is required');
    }

    const { uid } = await this.firebaseService.verifyIdToken(token, true);

    const userRoles = [
      ...(Array.isArray(request?.user?.roles) ? request.user.roles : []),
      ...(request?.user?.role ? [request.user.role] : []),
    ];

    return this.parentService.update(parentId, updateParentDto, uid, userRoles);
  }

  @Delete(':parentId')
  @UseGuards(
    RolesGuard(Role.COLLABORATOR, Role.COMPANY, Role.ADMIN),
    ParentOwnerOrCompanyGuard,
  )
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Deleta um parent' })
  @ApiResponse({ status: 204, description: 'Parent deletado com sucesso.' })
  @HttpCode(204)
  async delete(
    @IdToken() token: string,
    @Param('parentId') parentId: string,
    @Req() request: any,
  ) {
    if (!token) {
      throw new BadRequestException('id token is required');
    }

    const { uid } = await this.firebaseService.verifyIdToken(token, true);

    const userRoles = [
      ...(Array.isArray(request?.user?.roles) ? request.user.roles : []),
      ...(request?.user?.role ? [request.user.role] : []),
    ];

    return this.parentService.delete(parentId, uid, userRoles);
  }
}
