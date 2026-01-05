import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { Company } from '../models/company.model';
import { BaseModel } from '../models/base.model';

@Injectable()
export class CompaniesService {
  private collection: admin.firestore.CollectionReference<admin.firestore.DocumentData>;

  constructor(@Inject('FIRESTORE') private readonly firestore: admin.firestore.Firestore) {
    this.collection = this.firestore.collection('companies');
  }

  async create(dto: CreateCompanyDto) {
    const data = BaseModel.toFirestore(dto as any);
    const ref = await this.collection.add(data as any);
    const snap = await ref.get();
    return BaseModel.fromFirestore.call(Company as any, snap);
  }

  async findAll() {
    const snap = await this.collection.get();
    return snap.docs.map(d => BaseModel.fromFirestore.call(Company as any, d));
  }

  async findOne(id: string) {
    const doc = await this.collection.doc(id).get();
    if (!doc.exists) throw new NotFoundException('Company not found');
    return BaseModel.fromFirestore.call(Company as any, doc);
  }

  async update(id: string, dto: UpdateCompanyDto) {
    const ref = this.collection.doc(id);
    await ref.set(BaseModel.toFirestore(dto as any), { merge: true });
    const doc = await ref.get();
    if (!doc.exists) throw new NotFoundException('Company not found');
    return BaseModel.fromFirestore.call(Company as any, doc);
  }

  async remove(id: string) {
    await this.collection.doc(id).delete();
    return { deleted: true };
  }
}
