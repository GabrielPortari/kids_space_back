import { Inject, Injectable } from "@nestjs/common";
import { AppBadRequestException, AppNotFoundException } from "../exceptions";
import * as admin from 'firebase-admin';
import { Attendance } from "../models/attendance";
import { BaseModel } from "../models/base.model";
import { CreateCheckinDto } from "./dto/create-checkin.dto";
import { CreateCheckoutDto } from "./dto/create-checkout.dto";

@Injectable()
export class AttendanceService {
    
    private attendanceCollection: admin.firestore.CollectionReference<admin.firestore.DocumentData>;
    constructor(@Inject('FIRESTORE') private readonly firestore: admin.firestore.Firestore) {
        this.attendanceCollection = this.firestore.collection('attendanceRecords');
    }

    async doCheckin(createCheckinDto: CreateCheckinDto) {
      if (!createCheckinDto?.childId) throw new AppBadRequestException('childId is required for checkin');

      const childId = createCheckinDto.childId;
      const openQuery = this.attendanceCollection
        .where('childId', '==', childId)
        .where('attendanceType', '==', 'checkin')
        .limit(1);

      const openSnap = await openQuery.get();
      if (!openSnap.empty) throw new AppBadRequestException('There is already an open attendance session for this child');

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

      const saved = await this.firestore.runTransaction(async (t) => {
        const childRef = this.firestore.collection('children').doc(childId);
        const childSnap = await t.get(childRef);

        t.set(docRef, data);
        if (childSnap.exists) {
          t.update(childRef, { checkedIn: true });
        } else {
          t.set(childRef, { checkedIn: true }, { merge: true });
        }

        return t.get(docRef);
      });

      return Attendance.fromFirestore(saved);
    }

    async doCheckout(createCheckoutDto: CreateCheckoutDto) {
      if (!createCheckoutDto?.childId) throw new AppBadRequestException('childId is required for checkout');

      const childId = createCheckoutDto.childId;
      const openQuery = this.attendanceCollection
        .where('childId', '==', childId)
        .where('attendanceType', '==', 'checkin')
        .orderBy('checkInTime', 'desc')
        .limit(1);

      const openSnap = await openQuery.get();
      if (openSnap.empty) throw new AppBadRequestException('No open attendance session found for this child');

      const doc = openSnap.docs[0];
      const docRef = doc.ref;

      const saved = await this.firestore.runTransaction(async (transaction) => {
        const snap = await transaction.get(docRef);
        const childRef = this.firestore.collection('children').doc(childId);
        const childSnap = await transaction.get(childRef);

        if (!snap.exists) throw new AppNotFoundException('Attendance session not found');
        const existing = Attendance.fromFirestore(snap);

        if (existing.attendanceType !== 'checkin') throw new AppBadRequestException('Attendance session is not open');

        let checkInTime: Date | null = null;
        if (existing.checkInTime) {
          const v: any = existing.checkInTime;
          checkInTime = typeof v.toDate === 'function' ? v.toDate() : new Date(v);
        }

        const checkOutDate = new Date();
        const durationSeconds = checkInTime ? Math.round((checkOutDate.getTime() - checkInTime.getTime()) / 1000) : null;

        const mergedNotes = [createCheckoutDto.notes, existing.notes].filter(Boolean).join('\n') || undefined;

        const updated = new Attendance({
          ...existing,
          attendanceType: 'checkout',
          checkOutTime: checkOutDate,
          timeCheckedIn: durationSeconds ?? undefined,
          responsibleId: existing.responsibleId,
          notes: mergedNotes,
          collaboratorCheckedOutId: createCheckoutDto.collaboratorCheckedOutId || undefined,
        });

        const updateData = BaseModel.toFirestore(updated);
        transaction.update(docRef, updateData);
        if (childSnap.exists) {
          transaction.update(childRef, { checkedIn: false });
        } else {
          transaction.set(childRef, { checkedIn: false }, { merge: true });
        }

        return transaction.get(docRef);
      });

      return Attendance.fromFirestore(saved);
    }
    
    async getAttendancesByCompanyId(companyId: string) {
      if (!companyId) throw new AppBadRequestException('companyId is required');
      const query = this.attendanceCollection.where('companyId', '==', companyId).orderBy('checkInTime', 'desc');
      const snap = await query.get();
      return snap.docs.map(d => Attendance.fromFirestore(d));
    }

    async getLast10Attendances(companyId: string) {
      if (!companyId) throw new AppBadRequestException('companyId is required');
      const query = this.attendanceCollection.where('companyId', '==', companyId).orderBy('checkInTime', 'desc').limit(10);
      const snap = await query.get();
      return snap.docs.map(d => Attendance.fromFirestore(d));
    }

    async getActiveCheckinsByCompanyId(companyId: string) {
      if (!companyId) throw new AppBadRequestException('companyId is required');
      const query = this.attendanceCollection.where('companyId', '==', companyId).where('attendanceType', '==', 'checkin').orderBy('checkInTime', 'desc');
      const snap = await query.get();
      return snap.docs.map(d => Attendance.fromFirestore(d));
    }

    async getLastCheckin(companyId: string) {
      if (!companyId) throw new AppBadRequestException('companyId is required');
      const query = this.attendanceCollection.where('companyId', '==', companyId).where('attendanceType', '==', 'checkin').orderBy('checkInTime', 'desc').limit(1);
      const snap = await query.get();
      if (snap.empty) return null;
      return Attendance.fromFirestore(snap.docs[0]);
    }

    async getLastCheckout(companyId: string) {
      if (!companyId) throw new AppBadRequestException('companyId is required');
      const query = this.attendanceCollection.where('companyId', '==', companyId).where('attendanceType', '==', 'checkout').orderBy('checkOutTime', 'desc').limit(1);
      const snap = await query.get();
      if (snap.empty) return null;
      return Attendance.fromFirestore(snap.docs[0]);
    }

    async getAttendanceById(id: string) {
      const doc = await this.attendanceCollection.doc(id).get();
      if (!doc.exists) return null;
      return Attendance.fromFirestore(doc);
    }

    async getAttendancesBetween(companyId: string, from?: string | Date, to?: string | Date) {
      if (!companyId) throw new AppBadRequestException('companyId is required');

      let query: admin.firestore.Query<admin.firestore.DocumentData> = this.attendanceCollection.where('companyId', '==', companyId);

      if (from) {
        const fromDate = from instanceof Date ? from : new Date(String(from));
        if (isNaN(fromDate.getTime())) throw new AppBadRequestException('Invalid from date');
        query = query.where('checkInTime', '>=', admin.firestore.Timestamp.fromDate(fromDate));
      }

      if (to) {
        const toDate = to instanceof Date ? to : new Date(String(to));
        if (isNaN(toDate.getTime())) throw new AppBadRequestException('Invalid to date');
        query = query.where('checkInTime', '<=', admin.firestore.Timestamp.fromDate(toDate));
      }

      query = query.orderBy('checkInTime', 'desc');

      const snap = await query.get();
      return snap.docs.map(d => Attendance.fromFirestore(d));
    }
}