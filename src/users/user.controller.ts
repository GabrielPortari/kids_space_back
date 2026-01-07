import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards, Inject, ForbiddenException, BadRequestException } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { RolesGuard } from 'src/roles/roles.guard';
import { ApiBearerAuth } from '@nestjs/swagger';
import { IdToken } from 'src/auth/dto/id-token.decorator';
import { FirebaseService } from 'src/firebase/firebase.service';
import * as admin from 'firebase-admin';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService,
    private readonly firebaseService: FirebaseService,
    @Inject('FIRESTORE') private readonly firestore: admin.firestore.Firestore,
  ) {}

  @Post('register')
  @ApiBearerAuth()
  @UseGuards(RolesGuard('collaborator', 'companyAdmin', 'systemAdmin'))
  async createUser(@IdToken() token: string, @Body() createUserDto: CreateUserDto) {
    if (!token) throw new ForbiddenException('Missing auth token');

    const decoded = await this.firebaseService.verifyIdToken(token);
    const uid = decoded.uid;
    const callerRoles = decoded.roles || [];

    // systemAdmin must provide a companyId in the body
    if (callerRoles.includes('systemAdmin')) {
      if (!createUserDto.companyId) {
        throw new BadRequestException('systemAdmin must provide companyId in request body');
      }
      return this.userService.createUser(createUserDto);
    }

    // other roles must be affiliated to a company — derive companyId from collaborator
    const collabDoc = await this.firestore.collection('collaborators').doc(uid).get();
    if (!collabDoc.exists) throw new ForbiddenException('Collaborator not found');

    const collabData = collabDoc.data() as any;
    const companyIdFromCollab = collabData.companyId;

    if (!companyIdFromCollab) throw new ForbiddenException('Collaborator has no company assigned');

    // Force the companyId from the collaborator regardless of incoming body
    createUserDto.companyId = companyIdFromCollab;

    return this.userService.createUser(createUserDto);
  }
}
