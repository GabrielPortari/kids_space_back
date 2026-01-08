import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from '../models/user.model';
import { BaseModel } from '../models/base.model';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UserService {
  private collection: admin.firestore.CollectionReference<admin.firestore.DocumentData>;

  constructor(@Inject('FIRESTORE') private readonly firestore: admin.firestore.Firestore) {
    this.collection = this.firestore.collection('users');
  }

  async registerUser(createUserDto: CreateUserDto) {
    const ref = this.collection.doc();
    const user = new User({
      id: ref.id,
      ...createUserDto,
    });

    const data = BaseModel.toFirestore(user);
    await ref.set(data);

    return user;
  }

  async deleteUser(id: string) {
    if (!id) throw new BadRequestException('id is required to delete user');
    const userDoc = await this.collection.doc(id).get();
    if (!userDoc.exists) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
    await this.collection.doc(id).delete();
    return { message: `User with id ${id} deleted successfully` };
  }

  async updateUser(id: string, updateUserDto: UpdateUserDto) {
    if (!id) throw new BadRequestException('id is required to update user');
    const userDoc = await this.collection.doc(id).get();
    if (!userDoc.exists) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
    const updatedData = {
      ...updateUserDto,
    };
    await this.collection.doc(id).update(updatedData);
    const updatedUserDoc = await this.collection.doc(id).get();
    return updatedUserDoc.data();
  }

  async getUserById(id: string) {
    if (!id) throw new BadRequestException('id is required to get user');
    const userDoc = await this.collection.doc(id).get();
    if (!userDoc.exists) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
    return userDoc.data();
  }

}
