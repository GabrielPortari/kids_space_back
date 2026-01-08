import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards, Inject, ForbiddenException, BadRequestException } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { RolesGuard } from 'src/roles/roles.guard';
import { ApiBearerAuth } from '@nestjs/swagger';
import { IdToken } from 'src/auth/dto/id-token.decorator';
import { FirebaseService } from 'src/firebase/firebase.service';
import * as admin from 'firebase-admin';
import { UpdateUserDto } from './dto/update-user.dto';

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
    const collabDoc = await this.firestore.collection('collaborators').doc(uid).get();
    if (!collabDoc.exists) throw new ForbiddenException('Collaborator not found');

    const collabData = collabDoc.data() as any;
    const companyIdFromCollab = collabData.companyId;

    if (!companyIdFromCollab) throw new ForbiddenException('Collaborator has no company assigned');

    // forçar o companyId do colaborador que está fazendo a requisição
    createUserDto.companyId = companyIdFromCollab;

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
  async updateUser(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.updateUser(id, updateUserDto);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(RolesGuard('collaborator', 'companyAdmin', 'systemAdmin'))
  async deleteUser(@Param('id') id: string) {
    return this.userService.deleteUser(id);
  }
}
