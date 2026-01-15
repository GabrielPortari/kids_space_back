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

  async getCollaboratorById(id: string) {
    if (!id) throw new BadRequestException('id is required to get collaborator');
    const collaboratorDoc = await this.collaboratorCollection.doc(id).get();
    if (!collaboratorDoc.exists) {
      throw new NotFoundException(`Collaborator with id ${id} not found`);
    }
    const data = collaboratorDoc.data() as Collaborator | undefined;
    return { id: collaboratorDoc.id, ...(data || {}) };
  }

  async updateCollaborator(id: string, updateCollaboratorDto: UpdateCollaboratorDto) {
    if (!id) throw new BadRequestException('id is required to update collaborator');
    const collaboratorDocRef = this.collaboratorCollection.doc(id);
    const collaboratorDoc = await collaboratorDocRef.get();
    if (!collaboratorDoc.exists) {
      throw new NotFoundException(`Collaborator with id ${id} not found`);
    }
    const current = collaboratorDoc.data();
    // Prevent changing companyId
    if ((updateCollaboratorDto as any).companyId && (updateCollaboratorDto as any).companyId !== current?.companyId) {
      throw new BadRequestException('companyId cannot be changed');
    }
    const updatedData = {
      ...updateCollaboratorDto,
    };
    // Ensure companyId is not written/overwritten
    delete (updatedData as any).companyId;
    await collaboratorDocRef.update(updatedData);
    const updatedCollaboratorDoc = await collaboratorDocRef.get();
    return updatedCollaboratorDoc.data();
  }

  async deleteCollaborator(id: string) {
    if (!id) throw new BadRequestException('id is required to delete collaborator');
    const collaboratorDoc = await this.collaboratorCollection.doc(id).get();
    if (!collaboratorDoc.exists) {
      throw new NotFoundException(`Collaborator with id ${id} not found`);
    }
    // Archive collaborator marker and delete Firestore doc in a transaction,
    // then remove the Auth user.
    await this.firestore.runTransaction(async transaction => {
      const collRef = this.collaboratorCollection.doc(id);
      const collDeletedRef = this.firestore.collection('collaborators_deleted').doc(id);
      transaction.set(collDeletedRef, {
        deletedDate: admin.firestore.FieldValue.serverTimestamp(),
      });
      transaction.delete(collRef);
    });

    // remove auth user (outside transaction)
    await this.firebaseService.deleteUser(id);
    return { message: `Collaborator with id ${id} deleted and archived in collaborators_deleted` };
  }

  async getAllCollaboratorsFromCompany(companyId?: string) {
    let snapshot: admin.firestore.QuerySnapshot<admin.firestore.DocumentData>;
    if (companyId) {
      const q = this.collaboratorCollection.where('companyId', '==', companyId);
      snapshot = await q.get();
    } else {
      snapshot = await this.collaboratorCollection.get();
    }

    const collaborators: any[] = [];
    snapshot.forEach(doc => {
      collaborators.push({ ...(doc.data() as any), id: doc.id });
    });
    return collaborators;
  }
}
