import { Inject, Injectable } from "@nestjs/common";
import { FirebaseService } from "src/firebase/firebase.service";
import * as admin from 'firebase-admin';
import { CreateAttendanceDto } from "./dto/create-attendance.dto";
import { Attendance } from "src/models/attendance";
import { BaseModel } from "src/models/base.model";

@Injectable()
export class AttendanceService {
    private attendanceCollection: admin.firestore.CollectionReference<admin.firestore.DocumentData>;
    constructor(@Inject('FIRESTORE') private readonly firestore: admin.firestore.Firestore) {
        this.attendanceCollection = this.firestore.collection('attendanceRecords');
    }

    async doCheckin(createAttendanceDto: CreateAttendanceDto) {
      if (!createAttendanceDto?.childId) throw new Error('childId is required for checkin');

      const childId = createAttendanceDto.childId;
      const openQuery = this.attendanceCollection
        .where('childId', '==', childId)
        .where('status', '==', 'open')
        .limit(1);

      const openSnap = await openQuery.get();
      if (!openSnap.empty) throw new Error('There is already an open attendance session for this child');

      const checkInDate = createAttendanceDto.checkInTime ? new Date(createAttendanceDto.checkInTime) : new Date();

      const attendance = new Attendance({
        attendanceType: 'checkin',
        status: 'open',
        notes: createAttendanceDto.notes || undefined,
        collaboratorCheckedInId: createAttendanceDto.collaboratorCheckedInId || undefined,
        responsibleId: createAttendanceDto.responsibleId,
        childId,
        checkInTime: checkInDate,
      });

      const data = BaseModel.toFirestore(attendance);
      const docRef = this.attendanceCollection.doc();

      await this.firestore.runTransaction(async (t) => {
        t.set(docRef, data);
      });

      const saved = await docRef.get();
      return Attendance.fromFirestore(saved);
    }

    async doCheckout(createAttendanceDto: CreateAttendanceDto) {
      if (!createAttendanceDto?.childId) throw new Error('childId is required for checkout');

      const childId = createAttendanceDto.childId;
      const openQuery = this.attendanceCollection
        .where('childId', '==', childId)
        .where('status', '==', 'open')
        .orderBy('checkInTime', 'desc')
        .limit(1);

      const openSnap = await openQuery.get();
      if (openSnap.empty) throw new Error('No open attendance session found for this child');

      const doc = openSnap.docs[0];
      const docRef = doc.ref;

      await this.firestore.runTransaction(async (transaction) => {
        const snap = await transaction.get(docRef);
        if (!snap.exists) throw new Error('Attendance session not found');
        const existing = Attendance.fromFirestore(snap);

        if (existing.status !== 'open') throw new Error('Attendance session is not open');

        const checkInTime = existing.checkInTime ? new Date(existing.checkInTime) : null;
        const checkOutDate = createAttendanceDto.checkOutTime ? new Date(createAttendanceDto.checkOutTime) : new Date();

        const durationSeconds = checkInTime ? Math.round((checkOutDate.getTime() - checkInTime.getTime()) / 1000) : null;

        const updated = new Attendance({
          ...existing,
          attendanceType: 'checkout',
          checkOutTime: checkOutDate,
          timeCheckedIn: durationSeconds?.toString(),
          status: 'closed',
          // keep notes priority: incoming -> existing
          responsibleId: existing.responsibleId,
          notes: createAttendanceDto.notes || existing.notes || undefined,
          collaboratorCheckedInId: existing.collaboratorCheckedInId || undefined,
          collaboratorCheckedOutId: createAttendanceDto.collaboratorCheckedOutId || undefined,
          // add computed duration
        });

        const updateData = BaseModel.toFirestore(updated);
        transaction.update(docRef, updateData);
      });

      const saved = await docRef.get();
      return Attendance.fromFirestore(saved);
    }

    async getAttendance(id: string) {
      const doc = await this.attendanceCollection.doc(id).get();
      if (!doc.exists) return null;
      return Attendance.fromFirestore(doc);
    }
}