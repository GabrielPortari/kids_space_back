import * as admin from 'firebase-admin';
import { Collaborator } from '../../models/collaborator.model';
import { BaseModel } from '../../models/base.model';
import { Collections } from '../../constants/collections';

export class CollaboratorEntity {
  static collection = Collections.COLLABORATORS;

  static collectionRef() {
    return admin.firestore().collection(CollaboratorEntity.collection);
  }

  static docRef(id?: string) {
    return id
      ? CollaboratorEntity.collectionRef().doc(id)
      : CollaboratorEntity.collectionRef().doc();
  }

  // Converte o model de domínio para o objeto salvo no Firestore
  static toFirestore(model: Collaborator) {
    return BaseModel.toFirestore(model);
  }

  // Converte um DocumentSnapshot em Collaborator (preserva id/createdAt/updatedAt)
  static fromFirestore(
    doc:
      | admin.firestore.DocumentSnapshot
      | admin.firestore.QueryDocumentSnapshot,
  ): Collaborator {
    return (Collaborator as any).fromFirestore(doc) as Collaborator;
  }

  static fromFirestoreList(
    docs: Array<admin.firestore.QueryDocumentSnapshot>,
  ): Collaborator[] {
    return docs.map((doc) => CollaboratorEntity.fromFirestore(doc));
  }
}
