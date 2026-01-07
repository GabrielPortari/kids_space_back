import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from '../models/user.model';
import { BaseModel } from '../models/base.model';

@Injectable()
export class UserService {
  private collection: admin.firestore.CollectionReference<admin.firestore.DocumentData>;

  constructor(@Inject('FIRESTORE') private readonly firestore: admin.firestore.Firestore) {
    this.collection = this.firestore.collection('users');
  }

  async createUser(createUserDto: CreateUserDto) {
    const ref = this.collection.doc();
    const user = new User({
      id: ref.id,
      ...createUserDto,
    });

    const data = BaseModel.toFirestore(user);
    await ref.set(data);

    return user;
  }
}
