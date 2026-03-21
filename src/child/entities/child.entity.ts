import * as admin from 'firebase-admin';
import { User } from '../../models/child.model';
import { BaseModel } from '../../models/base.model';
import { Collections } from '../../constants/collections';

export class ChildEntity {
  static collection = Collections.CHILDREN;

  static collectionRef() {
    return admin.firestore().collection(ChildEntity.collection);
  }

  static docRef(id?: string) {
    return id
      ? ChildEntity.collectionRef().doc(id)
      : ChildEntity.collectionRef().doc();
  }

  static toFirestore(model: User) {
    return BaseModel.toFirestore(model);
  }

  static fromFirestore(
    doc:
      | admin.firestore.DocumentSnapshot
      | admin.firestore.QueryDocumentSnapshot,
  ): User {
    return (User as any).fromFirestore(doc) as User;
  }

  static fromFirestoreList(
    docs: Array<admin.firestore.QueryDocumentSnapshot>,
  ): User[] {
    return docs.map((doc) => ChildEntity.fromFirestore(doc));
  }
}
