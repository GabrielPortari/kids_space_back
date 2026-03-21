import * as admin from 'firebase-admin';
import { User } from '../../models/parent.model';
import { BaseModel } from '../../models/base.model';
import { Collections } from '../../constants/collections';

export class ParentEntity {
  static collection = Collections.USERS;

  static collectionRef() {
    return admin.firestore().collection(ParentEntity.collection);
  }

  static docRef(id?: string) {
    return id
      ? ParentEntity.collectionRef().doc(id)
      : ParentEntity.collectionRef().doc();
  }

  // Converte o model de domínio para o objeto salvo no Firestore
  static toFirestore(model: User) {
    return BaseModel.toFirestore(model);
  }

  // Converte um DocumentSnapshot em User (preserva id/createdAt/updatedAt)
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
    return docs.map((doc) => ParentEntity.fromFirestore(doc));
  }
}
