import { Inject, Injectable } from "@nestjs/common";
import * as admin from 'firebase-admin';
import { Attendance } from "src/models/attendance";
import { BaseModel } from "src/models/base.model";
import { CreateCheckinDto } from "./dto/create-checkin.dto";
import { CreateCheckoutDto } from "./dto/create-checkout.dto";

@Injectable()
export class AttendanceService {
    
    private attendanceCollection: admin.firestore.CollectionReference<admin.firestore.DocumentData>;
    constructor(@Inject('FIRESTORE') private readonly firestore: admin.firestore.Firestore) {
        this.attendanceCollection = this.firestore.collection('attendanceRecords');
    }

    async doCheckin(createCheckinDto: CreateCheckinDto) {
      if (!createCheckinDto?.childId) throw new Error('childId is required for checkin');

      const childId = createCheckinDto.childId;
      const openQuery = this.attendanceCollection
        .where('childId', '==', childId)
        .where('attendanceType', '==', 'checkin')
        .limit(1);

      const openSnap = await openQuery.get();
      if (!openSnap.empty) throw new Error('There is already an open attendance session for this child');

      const checkInDate = new Date();

      const attendance = new Attendance({
        attendanceType: 'checkin',
        notes: createCheckinDto.notes,
        collaboratorCheckedInId: createCheckinDto.collaboratorCheckedInId,
        responsibleId: createCheckinDto.responsibleId,
        childId: createCheckinDto.childId,
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

    async doCheckout(createCheckoutDto: CreateCheckoutDto) {
      if (!createCheckoutDto?.childId) throw new Error('childId is required for checkout');

      const childId = createCheckoutDto.childId;
      const openQuery = this.attendanceCollection
        .where('childId', '==', childId)
        .where('attendanceType', '==', 'checkin')
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

        if (existing.attendanceType !== 'checkin') throw new Error('Attendance session is not open');

          // existing.checkInTime may be a Firestore Timestamp or a Date/string.
          let checkInTime: Date | null = null;
          if (existing.checkInTime) {
            const v: any = existing.checkInTime;
            if (typeof v.toDate === 'function') {
              checkInTime = v.toDate();
            } else {
              checkInTime = new Date(v);
            }
          }

          const checkOutDate = new Date();
          const durationSeconds = checkInTime ? Math.round((checkOutDate.getTime() - checkInTime.getTime()) / 1000) : null;

          const updated = new Attendance({
            ...existing,
            attendanceType: 'checkout',
            checkOutTime: checkOutDate,
            // store numeric duration (seconds). Previously saved as string and could become NaN when checkInTime was a Timestamp.
            timeCheckedIn: durationSeconds ? durationSeconds : undefined,
            // keep notes priority: incoming -> existing
            responsibleId: existing.responsibleId,
            notes: existing.notes ? createCheckoutDto.notes?.concat(existing.notes) || existing.notes || undefined : createCheckoutDto.notes || undefined,
            collaboratorCheckedOutId: createCheckoutDto.collaboratorCheckedOutId || undefined,
          });

        const updateData = BaseModel.toFirestore(updated);
        transaction.update(docRef, updateData);
      });

      const saved = await docRef.get();
      return Attendance.fromFirestore(saved);
    }
    
    getAttendanceByCompanyId(companyId: string) {
      throw new Error("Method not implemented.");
    }

    async getAttendanceById(id: string) {
      const doc = await this.attendanceCollection.doc(id).get();
      if (!doc.exists) return null;
      return Attendance.fromFirestore(doc);
    }
}