import { Inject, Injectable, BadRequestException, NotFoundException } from "@nestjs/common";
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
      if (!createCheckinDto?.childId) throw new BadRequestException('childId is required for checkin');

      const childId = createCheckinDto.childId;
      const openQuery = this.attendanceCollection
        .where('childId', '==', childId)
        .where('attendanceType', '==', 'checkin')
        .limit(1);

      const openSnap = await openQuery.get();
      if (!openSnap.empty) throw new BadRequestException('There is already an open attendance session for this child');

      const checkInDate = new Date();

      const attendance = new Attendance({
        attendanceType: 'checkin',
        notes: createCheckinDto.notes,
        companyId: createCheckinDto.companyId,
        collaboratorCheckedInId: createCheckinDto.collaboratorCheckedInId,
        responsibleId: createCheckinDto.responsibleId,
        childId: createCheckinDto.childId,
        checkInTime: checkInDate,
      });

      const data = BaseModel.toFirestore(attendance);
      const docRef = this.attendanceCollection.doc();

      await this.firestore.runTransaction(async (t) => {
        const childRef = this.firestore.collection('children').doc(childId);
        const childSnap = await t.get(childRef);

        // all reads done, now perform writes
        t.set(docRef, data);
        if (childSnap.exists) {
          t.update(childRef, { checkedIn: true });
        } else {
          t.set(childRef, { checkedIn: true }, { merge: true });
        }
      });

      const saved = await docRef.get();
      return Attendance.fromFirestore(saved);
    }

    async doCheckout(createCheckoutDto: CreateCheckoutDto) {
      if (!createCheckoutDto?.childId) throw new BadRequestException('childId is required for checkout');

      const childId = createCheckoutDto.childId;
      const openQuery = this.attendanceCollection
        .where('childId', '==', childId)
        .where('attendanceType', '==', 'checkin')
        .orderBy('checkInTime', 'desc')
        .limit(1);

      const openSnap = await openQuery.get();
      if (openSnap.empty) throw new BadRequestException('No open attendance session found for this child');

      const doc = openSnap.docs[0];
      const docRef = doc.ref;

      await this.firestore.runTransaction(async (transaction) => {
        // Read attendance doc and child doc first
        const snap = await transaction.get(docRef);
        const childRef = this.firestore.collection('children').doc(childId);
        const childSnap = await transaction.get(childRef);

        if (!snap.exists) throw new NotFoundException('Attendance session not found');
        const existing = Attendance.fromFirestore(snap);

        if (existing.attendanceType !== 'checkin') throw new BadRequestException('Attendance session is not open');

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

        // All reads completed, now perform writes
        const updateData = BaseModel.toFirestore(updated);
        transaction.update(docRef, updateData);
        if (childSnap.exists) {
          transaction.update(childRef, { checkedIn: false });
        } else {
          transaction.set(childRef, { checkedIn: false }, { merge: true });
        }
      });

      const saved = await docRef.get();
      return Attendance.fromFirestore(saved);
    }
    
    async getAttendancesByCompanyId(companyId: string) {
      if(!companyId) throw new Error('companyId is required');
      const query = this.attendanceCollection
        .where('companyId', '==', companyId)
        .orderBy('checkInTime', 'desc');

      const snap = await query.get();
      return snap.docs.map(d => Attendance.fromFirestore(d));
    }

    async getLast10Attendances(companyId: string) {
      if(!companyId) throw new BadRequestException('companyId is required');
      const query = this.attendanceCollection
        .where('companyId', '==', companyId)
        .orderBy('checkInTime', 'desc')
        .limit(10);

      const snap = await query.get();
      return snap.docs.map(d => Attendance.fromFirestore(d));
    }

    async getActiveCheckinsByCompanyId(companyId: string) {
      if (!companyId) throw new BadRequestException('companyId is required');
      const query = this.attendanceCollection
        .where('companyId', '==', companyId)
        .where('attendanceType', '==', 'checkin')
        .orderBy('checkInTime', 'desc');

      const snap = await query.get();
      return snap.docs.map(d => Attendance.fromFirestore(d));
    }

    async getLastCheckin(companyId: string) {
      if(!companyId) throw new Error('companyId is required');
      const query = this.attendanceCollection
        .where('companyId', '==', companyId)
        .where('attendanceType', '==', 'checkin')
        .orderBy('checkInTime', 'desc')
        .limit(1);

      const snap = await query.get();
      if (snap.empty) return null;
      return Attendance.fromFirestore(snap.docs[0]);
    }

    async getLastCheckout(companyId: string) {
      if(!companyId) throw new Error('companyId is required');
      const query = this.attendanceCollection
        .where('companyId', '==', companyId)
        .where('attendanceType', '==', 'checkout')
        .orderBy('checkOutTime', 'desc')
        .limit(1);

      const snap = await query.get();
      if (snap.empty) return null;
      return Attendance.fromFirestore(snap.docs[0]);
    }

    async getAttendanceById(id: string) {
      const doc = await this.attendanceCollection.doc(id).get();
      if (!doc.exists) return null;
      return Attendance.fromFirestore(doc);
    }
}