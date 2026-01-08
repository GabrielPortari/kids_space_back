import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreateCollaboratorDto } from './dto/create-collaborator.dto';
import { FirebaseService } from 'src/firebase/firebase.service';
import * as admin from 'firebase-admin';
import { Collaborator } from '../models/collaborator.model';
import { BaseModel } from '../models/base.model';
import { UpdateCollaboratorDto } from './dto/update-collaborator.dto';

@Injectable()
export class CollaboratorService {
  private collaboratorCollection: admin.firestore.CollectionReference<admin.firestore.DocumentData>;
  constructor(private readonly firebaseService: FirebaseService,
    @Inject('FIRESTORE') private readonly firestore: admin.firestore.Firestore) {
    this.collaboratorCollection = this.firestore.collection('collaborators');
  }

  async createCollaborator(createCollaborator: CreateCollaboratorDto) {
    const collaboratorAuth = await this.firebaseService.createUser({
      displayName: createCollaborator.name ?? '',
      email: createCollaborator.email,
      password: createCollaborator.password,
    });

    if (createCollaborator.roles?.length) {
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

  async getCollaboratorById(id: string) {
    if (!id) throw new BadRequestException('id is required to get collaborator');
    const collaboratorDoc = await this.collaboratorCollection.doc(id).get();
    if (!collaboratorDoc.exists) {
      throw new NotFoundException(`Collaborator with id ${id} not found`);
    }
    return collaboratorDoc.data();
  }

  async updateCollaborator(id: string, updateCollaboratorDto: UpdateCollaboratorDto) {
    if (!id) throw new BadRequestException('id is required to update collaborator');
    const collaboratorDoc = await this.collaboratorCollection.doc(id).get();
    if (!collaboratorDoc.exists) {
      throw new NotFoundException(`Collaborator with id ${id} not found`);
    }
    const updatedData = {
      ...updateCollaboratorDto,
    };
    await this.collaboratorCollection.doc(id).update(updatedData);
    const updatedCollaboratorDoc = await this.collaboratorCollection.doc(id).get();
    return updatedCollaboratorDoc.data();
  }

  async deleteCollaborator(id: string) {
    if (!id) throw new BadRequestException('id is required to delete collaborator');
    const collaboratorDoc = await this.collaboratorCollection.doc(id).get();
    if (!collaboratorDoc.exists) {
      throw new NotFoundException(`Collaborator with id ${id} not found`);
    }
    await this.firebaseService.deleteUser(id);
    await this.collaboratorCollection.doc(id).delete();
    return { message: `Collaborator with id ${id} deleted successfully` };
  }
}
