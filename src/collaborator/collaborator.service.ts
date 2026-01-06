import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { CreateCollaboratorDto } from './dto/create-collaborator.dto';
import { UpdateCollaboratorDto } from './dto/update-collaborator.dto';
import { Collaborator } from '../models/collaborator.model';
import { BaseModel } from '../models/base.model';
import { FirebaseService } from 'src/firebase/firebase.service';

@Injectable()
export class CollaboratorService {
  constructor(private readonly firebaseService: FirebaseService) {}

  async createCollaborator(createCollaborator: CreateCollaboratorDto){
    const user = await this.firebaseService.createUser({
      displayName: createCollaborator.name,
      email: createCollaborator.email,
      password: createCollaborator.password,
    });

    if(createCollaborator.roles?.length){
      await this.firebaseService.setCumstomUserClaims(user.uid, {
        roles: createCollaborator.roles
      }); 
    }
    return user;
  }
}
