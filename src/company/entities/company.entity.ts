import * as admin from 'firebase-admin';
import { Company } from '../../models/company.model';
import { BaseModel } from '../../models/base.model';
import { Collections } from 'src/constants/collections';

export class CompanyEntity {
  static collection = Collections.COMPANIES;

  static collectionRef() {
    return admin.firestore().collection(CompanyEntity.collection);
  }

  static docRef(id?: string) {
    return id
      ? CompanyEntity.collectionRef().doc(id)
      : CompanyEntity.collectionRef().doc();
  }

  // Converte o model de domínio para o objeto salvo no Firestore
  static toFirestore(model: Company) {
    return BaseModel.toFirestore(model);
  }

  // Converte um DocumentSnapshot em Company (preserva id/createdAt/updatedAt)
  static fromFirestore(
    doc:
      | admin.firestore.DocumentSnapshot
      | admin.firestore.QueryDocumentSnapshot,
  ): Company {
    return (Company as any).fromFirestore(doc) as Company;
  }

  static fromFirestoreList(
    docs: Array<admin.firestore.QueryDocumentSnapshot>,
  ): Company[] {
    return docs.map((doc) => CompanyEntity.fromFirestore(doc));
  }
}
