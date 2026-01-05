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
    return await this.firebaseService.createUser({
      email: createCollaborator.email,
      password: createCollaborator.password,
      displayName: createCollaborator.name,
    });
  }
}
