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
import { CollaboratorService } from './collaborator.service';
import { CreateCollaboratorDto } from './dto/create-collaborator.dto';
import { Role } from '../constants/roles';
import { RolesGuard } from '../roles/roles.guard';
import { IdToken } from '../auth/dto/id-token.decorator';
import { FirebaseService } from '../firebase/firebase.service';
import { UpdateCollaboratorAdminDto } from './dto/update-collaborator-admin.dto';
import { FindCollaboratorsQueryDto } from './dto/find-collaborators-query.dto';
import { CollaboratorOwnerOrAdminGuard } from './guards/collaborator-owner-or-admin.guard';

@Controller('v2/collaborators')
export class CollaboratorController {
  constructor(
    private readonly collaboratorService: CollaboratorService,
    private readonly firebaseService: FirebaseService,
  ) {}

  @Post()
  @UseGuards(RolesGuard(Role.COMPANY, Role.ADMIN))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cria um novo collaborator' })
  @ApiResponse({ status: 201, description: 'Collaborator criado com sucesso.' })
  @HttpCode(201)
  async create(
    @IdToken() token: string,
    @Body() createCollaboratorDto: CreateCollaboratorDto,
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

    return this.collaboratorService.create(
      createCollaboratorDto,
      uid,
      userRoles,
    );
  }

  @Get()
  @UseGuards(RolesGuard(Role.COMPANY, Role.ADMIN))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Lista collaborators' })
  @ApiResponse({
    status: 200,
    description: 'Lista de collaborators retornada.',
  })
  async findAll(
    @IdToken() token: string,
    @Query() query: FindCollaboratorsQueryDto,
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

    return this.collaboratorService.findAll(uid, query, userRoles);
  }

  @Get(':collaboratorId')
  @UseGuards(
    RolesGuard(Role.COMPANY, Role.ADMIN),
    CollaboratorOwnerOrAdminGuard,
  )
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtem um collaborator por ID' })
  @ApiResponse({
    status: 200,
    description: 'Dados do collaborator retornados.',
  })
  findOne(@Param('collaboratorId') collaboratorId: string) {
    return this.collaboratorService.findOne(collaboratorId);
  }

  @Patch(':collaboratorId')
  @UseGuards(
    RolesGuard(Role.COMPANY, Role.ADMIN),
    CollaboratorOwnerOrAdminGuard,
  )
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Atualiza um collaborator' })
  @ApiResponse({
    status: 200,
    description: 'Collaborator atualizado com sucesso.',
  })
  async update(
    @IdToken() token: string,
    @Param('collaboratorId') collaboratorId: string,
    @Body() updateCollaboratorDto: UpdateCollaboratorAdminDto,
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

    return this.collaboratorService.update(
      collaboratorId,
      updateCollaboratorDto,
      uid,
      userRoles,
    );
  }

  @Delete(':collaboratorId')
  @UseGuards(
    RolesGuard(Role.COMPANY, Role.ADMIN),
    CollaboratorOwnerOrAdminGuard,
  )
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Deleta um collaborator' })
  @ApiResponse({
    status: 204,
    description: 'Collaborator deletado com sucesso.',
  })
  @HttpCode(204)
  async delete(
    @IdToken() token: string,
    @Param('collaboratorId') collaboratorId: string,
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

    return this.collaboratorService.delete(collaboratorId, uid, userRoles);
  }
}
