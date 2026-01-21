import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { CreateChildDto } from './dto/create-child.dto';

@Injectable()
export class ChildrenService {


  private collection: admin.firestore.CollectionReference<admin.firestore.DocumentData>;

  constructor(@Inject('FIRESTORE') private readonly firestore: admin.firestore.Firestore) {
    this.collection = this.firestore.collection('children');
  }

  async getChildByCompanyId(companyId?: string) {
    let snapshot: admin.firestore.QuerySnapshot<admin.firestore.DocumentData>;
    if (companyId) {
      const q = this.collection.where('companyId', '==', companyId);
      snapshot = await q.get();
    } else {
      snapshot = await this.collection.get();
    }

    const children: any[] = [];
    snapshot.forEach(doc => {
      children.push({ ...(doc.data() as any), id: doc.id });
    });
    return children;
  }

  async deleteChild(id: string) {
    if (!id) throw new BadRequestException('id is required to delete child');
    const childRef = this.collection.doc(id);
    const childDoc = await childRef.get();
    if (!childDoc.exists) {
      throw new NotFoundException(`Child with id ${id} not found`);
    }

    const childData = childDoc.data() as any || {};
    if (childData.checkedIn === true) {
      throw new BadRequestException('Cannot delete a child while checked in');
    }

    // Archive minimal marker in top-level collection 'children_deleted'
    // and remove child id from users' childrenIds, then delete the child doc.
    await this.firestore.runTransaction(async transaction => {
      // Read necessary documents before any writes
      const usersWithChildQuery = this.firestore.collection('users').where('childrenIds', 'array-contains', id);
      const usersWithChildSnap = await transaction.get(usersWithChildQuery);
      const companyRef = childData.companyId ? this.firestore.collection('companies').doc(childData.companyId) : null;
      const companySnap = companyRef ? await transaction.get(companyRef) : null;

      // Remove child id from users' childrenIds
      for (const uDoc of usersWithChildSnap.docs) {
        transaction.update(uDoc.ref, {
          childrenIds: admin.firestore.FieldValue.arrayRemove(id),
        });
      }

      // Store deleted marker with companyId in top-level collection 'children_deleted/{id}'
      const deletedRef = this.firestore.collection('children_deleted').doc(id);
      transaction.set(deletedRef, {
        deletedDate: admin.firestore.FieldValue.serverTimestamp(),
        companyId: childData.companyId,
      });

      // Finally delete the original child document
      transaction.delete(childRef);

      // Decrement company children counter if companyId present
      if (childData.companyId && companySnap && companySnap.exists) {
        transaction.update(companyRef!, { children: admin.firestore.FieldValue.increment(-1) });
      }
    });

    return { message: `Child with id ${id} deleted and archived in children_deleted` };
  }

  async updateChild(id: string, updateChildDto: CreateChildDto) {
    if (!id) throw new BadRequestException('id is required to update child');
    const childDoc = await this.collection.doc(id).get();
    if (!childDoc.exists) {
      throw new NotFoundException(`Child with id ${id} not found`);
    }
    const updatedData = {
      ...updateChildDto,
    };
    await this.collection.doc(id).update(updatedData);
    const updatedChildDoc = await this.collection.doc(id).get();
    return updatedChildDoc.data();
  }

  async getChildById(id: string) {
    if (!id) throw new BadRequestException('id is required to get child');
    const childDoc = await this.collection.doc(id).get();
    if (!childDoc.exists) {
      throw new NotFoundException(`Child with id ${id} not found`);
    }
    return childDoc.data();
  }

}
