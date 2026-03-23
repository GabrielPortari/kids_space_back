import * as admin from 'firebase-admin';
import { Admin } from '../../models/admin.model';
import { BaseModel } from '../../models/base.model';
import { Collections } from '../../constants/collections';

export class AdminEntity {
  static collection = Collections.ADMIN;

  static collectionRef() {
    return admin.firestore().collection(AdminEntity.collection);
  }

  static docRef(id?: string) {
    return id
      ? AdminEntity.collectionRef().doc(id)
      : AdminEntity.collectionRef().doc();
  }

  static toFirestore(model: Admin) {
    return BaseModel.toFirestore(model);
  }

  static fromFirestore(
    doc:
      | admin.firestore.DocumentSnapshot
      | admin.firestore.QueryDocumentSnapshot,
  ): Admin {
    return (Admin as any).fromFirestore(doc) as Admin;
  }

  static fromFirestoreList(
    docs: Array<admin.firestore.QueryDocumentSnapshot>,
  ): Admin[] {
    return docs.map((doc) => AdminEntity.fromFirestore(doc));
  }
}
