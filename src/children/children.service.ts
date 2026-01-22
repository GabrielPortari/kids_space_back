import { Inject, Injectable } from '@nestjs/common';
import { AppBadRequestException, AppNotFoundException } from '../exceptions';
import * as admin from 'firebase-admin';
import { CreateChildDto } from './dto/create-child.dto';

@Injectable()
export class ChildrenService {


  private collection: admin.firestore.CollectionReference<admin.firestore.DocumentData>;

  constructor(@Inject('FIRESTORE') private readonly firestore: admin.firestore.Firestore) {
    this.collection = this.firestore.collection('children');
  }

  async getChildByCompanyId(companyId?: string) {
    const query = companyId ? this.collection.where('companyId', '==', companyId) : this.collection;
    const snap = await query.get();
    return snap.docs.map(d => ({ ...(d.data() as any), id: d.id }));
  }

  async deleteChild(id: string) {
    if (!id) throw new AppBadRequestException('id is required to delete child');
    const childRef = this.collection.doc(id);
    const childDoc = await childRef.get();
    if (!childDoc.exists) throw new AppNotFoundException(`Child with id ${id} not found`);

    const childData = childDoc.data() as any || {};
    if (childData.checkedIn === true) throw new AppBadRequestException('Cannot delete a child while checked in');

    await this.firestore.runTransaction(async transaction => {
      const usersWithChildQuery = this.firestore.collection('users').where('childrenIds', 'array-contains', id);
      const usersWithChildSnap = await transaction.get(usersWithChildQuery);
      const companyRef = childData.companyId ? this.firestore.collection('companies').doc(childData.companyId) : null;
      const companySnap = companyRef ? await transaction.get(companyRef) : null;

      for (const uDoc of usersWithChildSnap.docs) {
        transaction.update(uDoc.ref, { childrenIds: admin.firestore.FieldValue.arrayRemove(id) });
      }

      const deletedRef = this.firestore.collection('children_deleted').doc(id);
      transaction.set(deletedRef, { deletedDate: admin.firestore.FieldValue.serverTimestamp(), companyId: childData.companyId });
      transaction.delete(childRef);

      if (childData.companyId && companySnap && companySnap.exists) transaction.update(companyRef!, { children: admin.firestore.FieldValue.increment(-1) });
    });

    return { message: `Child with id ${id} deleted and archived in children_deleted` };
  }

  async updateChild(id: string, updateChildDto: CreateChildDto) {
    if (!id) throw new AppBadRequestException('id is required to update child');
    const childDoc = await this.collection.doc(id).get();
    if (!childDoc.exists) throw new AppNotFoundException(`Child with id ${id} not found`);
    const updatedData = { ...updateChildDto };
    await this.collection.doc(id).update(updatedData);
    const updatedChildDoc = await this.collection.doc(id).get();
    return updatedChildDoc.data();
  }

  async getChildById(id: string) {
    if (!id) throw new AppBadRequestException('id is required to get child');
    const childDoc = await this.collection.doc(id).get();
    if (!childDoc.exists) throw new AppNotFoundException(`Child with id ${id} not found`);
    return childDoc.data();
  }

}
