import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { CreateChildDto } from './dto/create-child.dto';
import { UpdateChildDto } from './dto/update-child.dto';
import { Child } from '../models/child.model';
import { BaseModel } from '../models/base.model';

@Injectable()
export class ChildrenService {
  private collection: admin.firestore.CollectionReference<admin.firestore.DocumentData>;

  constructor(@Inject('FIRESTORE') private readonly firestore: admin.firestore.Firestore) {
    this.collection = this.firestore.collection('children');
  }

  async create(dto: CreateChildDto) {
    const data = BaseModel.toFirestore(dto as any);
    const ref = await this.collection.add(data as any);
    const snap = await ref.get();
    return BaseModel.fromFirestore.call(Child as any, snap);
  }

  async findAll() {
    const snap = await this.collection.get();
    return snap.docs.map(d => BaseModel.fromFirestore.call(Child as any, d));
  }

  async findOne(id: string) {
    const doc = await this.collection.doc(id).get();
    if (!doc.exists) throw new NotFoundException('Child not found');
    return BaseModel.fromFirestore.call(Child as any, doc);
  }

  async update(id: string, dto: UpdateChildDto) {
    const ref = this.collection.doc(id);
    await ref.set(BaseModel.toFirestore(dto as any), { merge: true });
    const doc = await ref.get();
    if (!doc.exists) throw new NotFoundException('Child not found');
    return BaseModel.fromFirestore.call(Child as any, doc);
  }

  async remove(id: string) {
    await this.collection.doc(id).delete();
    return { deleted: true };
  }
}
