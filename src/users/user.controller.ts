import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards, Inject, ForbiddenException, BadRequestException } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { RolesGuard } from 'src/roles/roles.guard';
import { ApiBearerAuth } from '@nestjs/swagger';
import { IdToken } from 'src/auth/dto/id-token.decorator';
import { FirebaseService } from 'src/firebase/firebase.service';
import * as admin from 'firebase-admin';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreateChildDto } from 'src/children/dto/create-child.dto';
import { User } from 'src/models/user.model';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService,
    private readonly firebaseService: FirebaseService,
    @Inject('FIRESTORE') private readonly firestore: admin.firestore.Firestore,
  ) {}

  @Post('register')
  @ApiBearerAuth()
  @UseGuards(RolesGuard('collaborator', 'companyAdmin', 'systemAdmin'))
  async registerUser(@IdToken() token: string, @Body() createUserDto: CreateUserDto) {
    if (!token) throw new ForbiddenException('Missing auth token');

    const decoded = await this.firebaseService.verifyIdToken(token);
    const uid = decoded.uid;
    const callerRoles = decoded.roles || [];

    // se o usuário for systemAdmin, ele pode criar usuários para qualquer empresa, mas deve passar o id da empresa no corpo da requisição
    if (callerRoles.includes('systemAdmin')) {
      if (!createUserDto.companyId) {
        throw new BadRequestException('systemAdmin must provide companyId in request body');
      }
      return this.userService.registerUser(createUserDto);
    }

    // caso contrário, o usuário deve ser collaborator ou companyAdmin e só pode criar usuários para a própria empresa
    const collaboratorDoc = await this.firestore.collection('collaborators').doc(uid).get();
    if (!collaboratorDoc.exists) throw new ForbiddenException('Collaborator not found');

    const collabData = collaboratorDoc.data() as any;
    const companyIdFromCollaborator = collabData.companyId;

    if (!companyIdFromCollaborator) throw new ForbiddenException('Collaborator has no company assigned');

    // forçar o companyId do colaborador que está fazendo a requisição
    createUserDto.companyId = companyIdFromCollaborator;

    return this.userService.registerUser(createUserDto);
  }

  @Get(':id')
  @ApiBearerAuth()
  @UseGuards(RolesGuard('collaborator', 'companyAdmin', 'systemAdmin'))
  async getUserById(@Param('id') id: string) {
    return this.userService.getUserById(id);
  }

  @Put(':id')
  @ApiBearerAuth()
  @UseGuards(RolesGuard('collaborator', 'companyAdmin', 'systemAdmin'))
  async updateUser(@Param('id') id: string, @Body() updateUserDto: CreateUserDto) {
    return this.userService.updateUser(id, updateUserDto);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(RolesGuard('collaborator', 'companyAdmin', 'systemAdmin'))
  async deleteUser(@Param('id') id: string) {
    return this.userService.deleteUser(id);
  }

  @Post(':parentId/children')
  @ApiBearerAuth()
  @UseGuards(RolesGuard('collaborator', 'companyAdmin', 'systemAdmin'))
  async createChild(@IdToken() token: string, @Param('parentId') parentId: string, @Body() createChildDto: CreateChildDto) {
    if (!token) throw new ForbiddenException('Missing auth token');

    const decoded = await this.firebaseService.verifyIdToken(token);
    const uid = decoded.uid;
    const callerRoles = decoded.roles || [];

    // recuperar o usuário pai
    const parentDoc = this.firestore.collection('users').doc(parentId);
    const parentSnap = await parentDoc.get();

    if (!parentSnap.exists) throw new BadRequestException(`Parent user with id ${parentId} not found`);
    const parentData = parentSnap.data() as User;

    // autorização: systemAdmin pode sempre; caso contrário, permitir se for o próprio pai ou colaborador da mesma empresa
    if (!callerRoles.includes('systemAdmin')) {
      if (uid !== parentId) {
        const collaboratorDoc = await this.firestore.collection('collaborators').doc(uid).get();
        if (!collaboratorDoc.exists) throw new ForbiddenException('Collaborator not found');
        const collabData = collaboratorDoc.data() as any;
        if (collabData.companyId !== parentData.companyId) throw new ForbiddenException('Not authorized to create child for this user');
      }
    }

    // sanitize payload: do not allow overriding companyId or responsibleUserIds
    delete (createChildDto as any).companyId;
    delete (createChildDto as any).responsibleUserIds;

    return this.userService.createChild(parentData, createChildDto);
  }
}
