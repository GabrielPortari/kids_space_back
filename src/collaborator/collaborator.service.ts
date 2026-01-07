import { Inject, Injectable } from '@nestjs/common';
import { CreateCollaboratorDto } from './dto/create-collaborator.dto';
import { FirebaseService } from 'src/firebase/firebase.service';
import * as admin from 'firebase-admin';
import { Collaborator } from '../models/collaborator.model';
import { BaseModel } from '../models/base.model';

@Injectable()
export class CollaboratorService {
  private collaboratorCollection: admin.firestore.CollectionReference<admin.firestore.DocumentData>;
  constructor(private readonly firebaseService: FirebaseService,
  @Inject('FIRESTORE') private readonly firestore: admin.firestore.Firestore) {
    this.collaboratorCollection = this.firestore.collection('collaborators');
  }

  async createCollaborator(createCollaborator: CreateCollaboratorDto){
    const collaboratorAuth = await this.firebaseService.createUser({
      displayName: createCollaborator.name ?? '',
      email: createCollaborator.email,
      password: createCollaborator.password,
    });

    if(createCollaborator.roles?.length){
      await this.firebaseService.setCustomUserClaims(collaboratorAuth.uid, {
        roles: createCollaborator.roles
      });
    }

    const collaboratorFS = new Collaborator({
      id: collaboratorAuth.uid,
      companyId: createCollaborator.companyId,
      email: createCollaborator.email,
      name: createCollaborator.name ?? '',
      userType: createCollaborator.userType ?? 'collaborator',
      roles: createCollaborator.roles ?? [],
      photoUrl: createCollaborator.photoUrl ?? '',
      phone: createCollaborator.phone ?? '',
      birthDate: createCollaborator.birthDate ?? '',
      document: createCollaborator.document ?? '',
      address: createCollaborator.address ?? '',
      addressNumber: createCollaborator.addressNumber ?? '',
      addressComplement: createCollaborator.addressComplement ?? '',
      neighborhood: createCollaborator.neighborhood ?? '',
      city: createCollaborator.city ?? '',
      state: createCollaborator.state ?? '',
      zipCode: createCollaborator.zipCode ?? '',
    });

    const data = BaseModel.toFirestore(collaboratorFS);
    await this.collaboratorCollection.doc(collaboratorAuth.uid).set(data);

    return collaboratorFS;
  }
}
