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
import { ChildService } from './child.service';
import { CreateChildDto } from './dto/create-child.dto';
import { Role } from '../constants/roles';
import { RolesGuard } from '../roles/roles.guard';
import { IdToken } from '../auth/dto/id-token.decorator';
import { FirebaseService } from '../firebase/firebase.service';
import { UpdateChildAdminDto } from './dto/update-child-admin.dto';
import { FindChildrenQueryDto } from './dto/find-children-query.dto';
import { ChildOwnerOrCompanyGuard } from './guards/child-owner-or-company.guard';

@Controller('v2/children')
export class ChildController {
  constructor(
    private readonly childService: ChildService,
    private readonly firebaseService: FirebaseService,
  ) {}

  @Post()
  @UseGuards(RolesGuard(Role.COLLABORATOR, Role.COMPANY, Role.ADMIN))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cria uma nova crianca' })
  @ApiResponse({ status: 201, description: 'Crianca criada com sucesso.' })
  @HttpCode(201)
  async create(
    @IdToken() token: string,
    @Body() createChildDto: CreateChildDto,
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

    return this.childService.create(createChildDto, uid, userRoles);
  }

  @Get()
  @UseGuards(RolesGuard(Role.COLLABORATOR, Role.COMPANY, Role.ADMIN))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Lista criancas' })
  @ApiResponse({ status: 200, description: 'Lista de criancas retornada.' })
  async findAll(
    @IdToken() token: string,
    @Query() query: FindChildrenQueryDto,
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

    return this.childService.findAll(uid, query, userRoles);
  }

  @Get(':childId')
  @UseGuards(
    RolesGuard(Role.COLLABORATOR, Role.COMPANY, Role.ADMIN),
    ChildOwnerOrCompanyGuard,
  )
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Busca crianca por ID' })
  @ApiResponse({ status: 200, description: 'Dados da crianca retornados.' })
  findOne(@Param('childId') childId: string) {
    return this.childService.findOne(childId);
  }

  @Patch(':childId')
  @UseGuards(
    RolesGuard(Role.COLLABORATOR, Role.COMPANY, Role.ADMIN),
    ChildOwnerOrCompanyGuard,
  )
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Atualiza crianca' })
  @ApiResponse({ status: 200, description: 'Crianca atualizada com sucesso.' })
  async update(
    @IdToken() token: string,
    @Param('childId') childId: string,
    @Body() updateChildDto: UpdateChildAdminDto,
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

    return this.childService.update(childId, updateChildDto, uid, userRoles);
  }

  @Delete(':childId')
  @UseGuards(
    RolesGuard(Role.COLLABORATOR, Role.COMPANY, Role.ADMIN),
    ChildOwnerOrCompanyGuard,
  )
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Remove crianca' })
  @ApiResponse({ status: 204, description: 'Crianca removida com sucesso.' })
  @HttpCode(204)
  async delete(
    @IdToken() token: string,
    @Param('childId') childId: string,
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

    return this.childService.delete(childId, uid, userRoles);
  }
}
