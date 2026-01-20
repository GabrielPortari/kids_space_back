import { Controller, Post, Body, Param, Put, Delete, Request, UseGuards, Get, HttpCode, Inject, ForbiddenException, BadRequestException } from '@nestjs/common';
import { CollaboratorService } from './collaborator.service';
import { CreateCollaboratorDto } from './dto/create-collaborator.dto';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiBody, ApiResponse } from '@nestjs/swagger';
import { RolesGuard } from 'src/roles/roles.guard';
import { IdToken } from 'src/auth/dto/id-token.decorator';
import * as admin from 'firebase-admin';
import { FirebaseService } from 'src/firebase/firebase.service';

@Controller('collaborator')
export class CollaboratorController {
  constructor(private readonly service: CollaboratorService,
    private readonly firebaseService: FirebaseService,
    @Inject('FIRESTORE') private readonly firestore: admin.firestore.Firestore,
  ) {}

  @Get(':id')
  @ApiOperation({ summary: 'Recupera colaborador por id' })
  @ApiParam({ name: 'id', description: 'Id do colaborador' })
  @ApiResponse({ status: 200, description: 'Colaborador retornado' })
  @ApiBearerAuth()
  @UseGuards(RolesGuard('master', 'systemAdmin', 'companyAdmin', 'collaborator'))
  async getCollaboratorById(@Param('id') id: string) {
    return this.service.getCollaboratorById(id);
  }

  @Get('/company/:companyId')
  @ApiOperation({ summary: 'Recupera todos os colaboradores de uma empresa' })
  @ApiParam({ name: 'companyId', description: 'Id da empresa' })
  @ApiResponse({ status: 200, description: 'Colaboradores retornados' })
  @ApiBearerAuth()
  @UseGuards(RolesGuard('master', 'systemAdmin', 'companyAdmin', 'collaborator'))
  async getCollaboratorsByCompanyId(@IdToken() token: string, @Param('companyId') companyId?: string) {
    if (!token) throw new ForbiddenException('Missing auth token');

    return this.service.getAllCollaboratorsFromCompany(companyId);
  }

@Post('register')
  @ApiOperation({ summary: 'Registra novo colaborador' })
  @ApiBody({ type: CreateCollaboratorDto })
  @ApiResponse({ status: 201, description: 'Colaborador registrado' })
  @ApiBearerAuth()
  @UseGuards(RolesGuard('companyAdmin', 'systemAdmin', 'master'))
  @HttpCode(201)
  async registerCollaborator(@IdToken() token: string, @Body() createCollaboratorDto: CreateCollaboratorDto) {
    if (!token) throw new ForbiddenException('Missing auth token');

    const decoded = await this.firebaseService.verifyIdToken(token);
    const uid = decoded.uid;
    const callerRoles = decoded.roles || [];

    // se o usuário for master/systemAdmin, ele pode criar colaboradores para qualquer empresa, mas deve passar o id da empresa no corpo da requisição
    if (callerRoles.includes('systemAdmin') || callerRoles.includes('master')) {
      if (!createCollaboratorDto.companyId) {
        throw new BadRequestException('systemAdmin/master must provide companyId in request body');
      }
      return this.service.registerCollaborator(createCollaboratorDto);
    }

    // caso contrário, o usuário deve ser companyAdmin e só pode criar usuários para a própria empresa
    const collaboratorDoc = await this.firestore.collection('collaborators').doc(uid).get();
    if (!collaboratorDoc.exists) throw new ForbiddenException('Collaborator not found');

    const collabData = collaboratorDoc.data() as any;
    const companyIdFromCollaborator = collabData.companyId;

    if (!companyIdFromCollaborator) throw new ForbiddenException('Collaborator has no company assigned');
    createCollaboratorDto.companyId = companyIdFromCollaborator;
    
    return this.service.registerCollaborator(createCollaboratorDto);
  }
  
  @Put(':id')
  @ApiOperation({ summary: 'Atualiza colaborador' })
  @ApiParam({ name: 'id', description: 'Id do colaborador' })
  @ApiBody({ type: CreateCollaboratorDto })
  @ApiResponse({ status: 200, description: 'Colaborador atualizado' })
  @ApiBearerAuth()
  @UseGuards(RolesGuard('master', 'systemAdmin', 'companyAdmin'))
  async updateCollaborator(@Param('id') id: string, @Body() createCollaboratorDto: CreateCollaboratorDto) {
    return this.service.updateCollaborator(id, createCollaboratorDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remove colaborador' })
  @ApiParam({ name: 'id', description: 'Id do colaborador' })
  @ApiResponse({ status: 204, description: 'Colaborador removido' })
  @ApiBearerAuth()
  @UseGuards(RolesGuard('master', 'systemAdmin', 'companyAdmin'))
  @HttpCode(204)
  async deleteCollaborator(@Param('id') id: string) {
    return this.service.deleteCollaborator(id);
  }
}
