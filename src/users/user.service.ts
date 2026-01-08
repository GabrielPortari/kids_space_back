import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from '../models/user.model';
import { BaseModel } from '../models/base.model';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreateChildDto } from 'src/children/dto/create-child.dto';
import { Child } from 'src/models/child.model';

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
    const userRef = this.collection.doc(id);
    const userDoc = await userRef.get();
    if (!userDoc.exists) {
      throw new NotFoundException(`User with id ${id} not found`);
    }

    const childrenCollection = this.firestore.collection('children');
    const childrenQuery = childrenCollection.where('responsibleUserIds', 'array-contains', id);
    const childrenSnapshot = await childrenQuery.get();

    await this.firestore.runTransaction(async transaction => {
      for (const childDoc of childrenSnapshot.docs) {
        const childSnap = await transaction.get(childDoc.ref);
        if (!childSnap.exists) continue;
        const childData = childSnap.data() as any;
        const childId = childSnap.id;
        const responsibleUserIds: string[] = Array.isArray(childData.responsibleUserIds)
          ? childData.responsibleUserIds
          : [];

        if (responsibleUserIds.length > 1) {
          transaction.update(childDoc.ref, {
            responsibleUserIds: admin.firestore.FieldValue.arrayRemove(id),
          });
        } else {
          // If this user is the only responsible, delete the child
          transaction.delete(childDoc.ref);
          // Also remove the child id from any users' childrenIds arrays
          const usersWithChildQuery = this.collection.where('childrenIds', 'array-contains', childId);
          const usersWithChildSnap = await transaction.get(usersWithChildQuery);
          for (const uDoc of usersWithChildSnap.docs) {
            transaction.update(uDoc.ref, {
              childrenIds: admin.firestore.FieldValue.arrayRemove(childId),
            });
          }
        }
      }
      // finally delete the user
      transaction.delete(userRef);
    });

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

  async createChild(parent: User, createChildDto: CreateChildDto) {
    if (!parent.id) throw new BadRequestException('parentId is required to create child');
    const childrenCollection = this.firestore.collection('children');
    const ref = childrenCollection.doc();
    const child = new Child({
      id: ref.id,
      responsibleUserIds: [parent.id],
      companyId: parent.companyId,
      status: false,
      userType: createChildDto.userType,
      photoUrl: createChildDto.photoUrl,
      name: createChildDto.name,
      email: createChildDto.email,
      phone: createChildDto.phone,
      birthDate: createChildDto.birthDate,
      document: createChildDto.document,
      // herda do responsável
      address: parent.address,
      addressNumber: parent.addressNumber,
      addressComplement: parent.addressComplement,
      neighborhood: parent.neighborhood,
      city: parent.city,
      state: parent.state,
      zipCode: parent.zipCode,
    });

    const data = BaseModel.toFirestore(child);
    // add server timestamp
    (data as any).createdAt = admin.firestore.FieldValue.serverTimestamp();

    // create atomically and confirm parent still exists
    const parentRef = this.firestore.collection('users').doc(parent.id);
    await this.firestore.runTransaction(async tx => {
      const parentSnap = await tx.get(parentRef);
      if (!parentSnap.exists) throw new BadRequestException('Parent user not found');
      tx.set(ref, data);
      // add child id to parent's childrenIds atomically
      tx.update(parentRef, {
        childrenIds: admin.firestore.FieldValue.arrayUnion(ref.id),
      });
    });

    const saved = await ref.get();
    return saved.data();
  }
}
