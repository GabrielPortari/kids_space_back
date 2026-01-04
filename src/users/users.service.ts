import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  private collection: admin.firestore.CollectionReference<admin.firestore.DocumentData>;

  constructor(@Inject('FIRESTORE') private readonly firestore: admin.firestore.Firestore) {
    this.collection = this.firestore.collection('users');
  }

  async create(dto: CreateUserDto) {
    const ref = await this.collection.add(dto as any);
    const snap = await ref.get();
    return { id: ref.id, ...snap.data() };
  }

  async findAll() {
    const snap = await this.collection.get();
    return snap.docs.map(d => ({ id: d.id, ...(d.data() as any) }));
  }

  async findOne(id: string) {
    const doc = await this.collection.doc(id).get();
    if (!doc.exists) throw new NotFoundException('User not found');
    return { id: doc.id, ...(doc.data() as any) };
  }

  async update(id: string, dto: Partial<CreateUserDto>) {
    const ref = this.collection.doc(id);
    await ref.set(dto as any, { merge: true });
    const doc = await ref.get();
    if (!doc.exists) throw new NotFoundException('User not found');
    return { id: doc.id, ...(doc.data() as any) };
  }

  async remove(id: string) {
    await this.collection.doc(id).delete();
    return { deleted: true };
  }
}
