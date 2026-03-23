import * as admin from 'firebase-admin';
import { Attendance } from '../../models/attendance.model';
import { BaseModel } from '../../models/base.model';
import { Collections } from '../../constants/collections';

export class AttendanceEntity {
  static collection = Collections.ATTENDANCES;

  static collectionRef() {
    return admin.firestore().collection(AttendanceEntity.collection);
  }

  static docRef(id?: string) {
    return id
      ? AttendanceEntity.collectionRef().doc(id)
      : AttendanceEntity.collectionRef().doc();
  }

  static toFirestore(model: Attendance) {
    return BaseModel.toFirestore(model);
  }

  static fromFirestore(
    doc:
      | admin.firestore.DocumentSnapshot
      | admin.firestore.QueryDocumentSnapshot,
  ): Attendance {
    return (Attendance as any).fromFirestore(doc) as Attendance;
  }

  static fromFirestoreList(
    docs: Array<admin.firestore.QueryDocumentSnapshot>,
  ): Attendance[] {
    return docs.map((doc) => AttendanceEntity.fromFirestore(doc));
  }
}
