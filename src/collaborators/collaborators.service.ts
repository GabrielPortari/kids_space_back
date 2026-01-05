import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { CreateCollaboratorDto } from './dto/create-collaborator.dto';
import { UpdateCollaboratorDto } from './dto/update-collaborator.dto';
import { Collaborator } from '../models/collaborator.model';
import { BaseModel } from '../models/base.model';

@Injectable()
export class CollaboratorsService {
  private collection: admin.firestore.CollectionReference<admin.firestore.DocumentData>;

  constructor(@Inject('FIRESTORE') private readonly firestore: admin.firestore.Firestore) {
    this.collection = this.firestore.collection('collaborators');
  }

  async create(dto: CreateCollaboratorDto) {
    const data = BaseModel.toFirestore(dto as any);
    const ref = await this.collection.add(data as any);
    const snap = await ref.get();
    return BaseModel.fromFirestore.call(Collaborator as any, snap);
  }

  async findAll() {
    const snap = await this.collection.get();
    return snap.docs.map(d => BaseModel.fromFirestore.call(Collaborator as any, d));
  }

  async findOne(id: string) {
    const doc = await this.collection.doc(id).get();
    if (!doc.exists) throw new NotFoundException('Collaborator not found');
    return BaseModel.fromFirestore.call(Collaborator as any, doc);
  }

  async update(id: string, dto: UpdateCollaboratorDto) {
    const ref = this.collection.doc(id);
    await ref.set(BaseModel.toFirestore(dto as any), { merge: true });
    const doc = await ref.get();
    if (!doc.exists) throw new NotFoundException('Collaborator not found');
    return BaseModel.fromFirestore.call(Collaborator as any, doc);
  }

  async remove(id: string) {
    await this.collection.doc(id).delete();
    return { deleted: true };
  }
}
