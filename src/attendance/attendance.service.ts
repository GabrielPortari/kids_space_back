import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { UpdateAttendanceDto } from './dto/update-attendance.dto';
import { CheckoutAttendanceDto } from './dto/checkout-attendance.dto';
import { AttendanceEntity } from './entities/attendance.entity';
import { Attendance, AttendanceType } from '../models/attendance.model';
import { FindAttendancesQueryDto } from './dto/find-attendances-query.dto';
import { hasAdminPrivileges } from '../constants/roles';
import { Collections } from '../constants/collections';
import { ChildEntity } from '../child/entities/child.entity';
import { ParentEntity } from '../parent/entities/parent.entity';
import { UpdateAttendanceAdminDto } from './dto/update-attendance-admin.dto';
import * as admin from 'firebase-admin';

@Injectable()
export class AttendanceService {
  async checkIn(
    createAttendanceDto: CreateAttendanceDto,
    actorCompanyId: string,
    actorUid: string,
    actorRoles: string[],
  ) {
    const isAdmin = hasAdminPrivileges(actorRoles);
    const payloadCompanyId = createAttendanceDto.companyId?.trim();

    const targetCompanyId = this.resolveTargetCompanyId(
      isAdmin,
      actorCompanyId,
      payloadCompanyId,
    );

    const attendanceRef = AttendanceEntity.docRef();
    const lockRef = this.activeLockRef(
      targetCompanyId,
      createAttendanceDto.childId,
    );
    const now = new Date();

    await admin.firestore().runTransaction(async (tx) => {
      const childRef = ChildEntity.docRef(createAttendanceDto.childId);
      const childDoc = await tx.get(childRef);

      if (!childDoc.exists) {
        throw new NotFoundException('Child not found');
      }

      const child = ChildEntity.fromFirestore(childDoc);
      if (child.companyId !== targetCompanyId) {
        throw new NotFoundException('Child not found');
      }

      if (
        createAttendanceDto.responsibleIdWhoCheckedInId &&
        !child.parents?.includes(
          createAttendanceDto.responsibleIdWhoCheckedInId,
        )
      ) {
        throw new BadRequestException(
          'Responsible is not linked to the provided child',
        );
      }

      const lockDoc = await tx.get(lockRef);
      if (lockDoc.exists) {
        throw new BadRequestException('Child already has an active check-in');
      }

      // Backward compatibility: detect old active attendance that predates lock docs.
      const legacyActive = await this.findActiveAttendanceInTransaction(
        tx,
        createAttendanceDto.childId,
        targetCompanyId,
      );

      if (legacyActive) {
        tx.set(lockRef, {
          attendanceId: legacyActive.id,
          companyId: targetCompanyId,
          childId: createAttendanceDto.childId,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        throw new BadRequestException('Child already has an active check-in');
      }

      const attendance = new Attendance({
        attendanceType: AttendanceType.CHECKIN,
        companyId: targetCompanyId,
        childId: createAttendanceDto.childId,
        notes: createAttendanceDto.notes?.trim(),
        collaboratorWhoCheckedInId: actorUid,
        responsibleIdWhoCheckedInId:
          createAttendanceDto.responsibleIdWhoCheckedInId,
        checkInTime: now,
        checkOutTime: undefined,
        timeCheckedInSeconds: 0,
      });

      tx.set(attendanceRef, AttendanceEntity.toFirestore(attendance));
      tx.set(lockRef, {
        attendanceId: attendanceRef.id,
        companyId: targetCompanyId,
        childId: createAttendanceDto.childId,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    });

    const created = await attendanceRef.get();
    return AttendanceEntity.fromFirestore(created);
  }

  async checkOut(
    checkoutDto: CheckoutAttendanceDto,
    actorCompanyId: string,
    actorUid: string,
    actorRoles: string[],
  ) {
    const isAdmin = hasAdminPrivileges(actorRoles);
    const payloadCompanyId = checkoutDto.companyId?.trim();
    const targetCompanyId = this.resolveTargetCompanyId(
      isAdmin,
      actorCompanyId,
      payloadCompanyId,
    );

    const lockRef = this.activeLockRef(targetCompanyId, checkoutDto.childId);
    let updatedAttendanceId = '';

    await admin.firestore().runTransaction(async (tx) => {
      const childRef = ChildEntity.docRef(checkoutDto.childId);
      const childDoc = await tx.get(childRef);

      if (!childDoc.exists) {
        throw new NotFoundException('Child not found');
      }

      const child = ChildEntity.fromFirestore(childDoc);
      if (child.companyId !== targetCompanyId) {
        throw new NotFoundException('Child not found');
      }

      let attendanceId: string | undefined;
      const lockDoc = await tx.get(lockRef);
      if (lockDoc.exists) {
        attendanceId = String(lockDoc.data()?.attendanceId || '');
      }

      // Backward compatibility: resolve active attendance even if no lock exists.
      if (!attendanceId) {
        const legacyActive = await this.findActiveAttendanceInTransaction(
          tx,
          checkoutDto.childId,
          targetCompanyId,
        );

        if (!legacyActive?.id) {
          throw new NotFoundException('Active attendance not found for child');
        }

        attendanceId = legacyActive.id;
        tx.set(lockRef, {
          attendanceId,
          companyId: targetCompanyId,
          childId: checkoutDto.childId,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      }

      const attendanceRef = AttendanceEntity.docRef(attendanceId);
      const attendanceDoc = await tx.get(attendanceRef);
      if (!attendanceDoc.exists) {
        throw new NotFoundException('Active attendance not found for child');
      }

      const activeAttendance = AttendanceEntity.fromFirestore(attendanceDoc);
      if (activeAttendance.checkOutTime) {
        throw new BadRequestException('Attendance already checked out');
      }

      const confirmedResponsibleId =
        await this.confirmResponsibleByDocumentInTransaction(
          tx,
          child.parents || [],
          checkoutDto.responsibleDocument,
        );

      const checkInTime = activeAttendance.checkInTime
        ? new Date(activeAttendance.checkInTime)
        : null;
      const now = new Date();

      const elapsedSeconds = checkInTime
        ? Math.max(
            0,
            Math.floor((now.getTime() - checkInTime.getTime()) / 1000),
          )
        : 0;

      const merged = new Attendance({
        ...activeAttendance,
        attendanceType: AttendanceType.CHECKOUT,
        collaboratorWhoCheckedOutId: actorUid,
        responsibleIdWhoCheckedOutId: confirmedResponsibleId,
        checkOutTime: now,
        timeCheckedInSeconds: elapsedSeconds,
        notes: checkoutDto.notes?.trim() || activeAttendance.notes,
      });

      tx.update(attendanceRef, AttendanceEntity.toFirestore(merged));
      tx.delete(lockRef);
      updatedAttendanceId = attendanceId;
    });

    const updated = await AttendanceEntity.docRef(updatedAttendanceId).get();
    return AttendanceEntity.fromFirestore(updated);
  }

  async findAll(
    companyId: string,
    query: FindAttendancesQueryDto,
    actorRoles: string[],
  ) {
    const isAdmin = hasAdminPrivileges(actorRoles);
    const queryCompanyId = query.companyId?.trim();

    let targetCompanyId = companyId;
    if (isAdmin && queryCompanyId) {
      targetCompanyId = queryCompanyId;
    }

    const snapshot = await AttendanceEntity.collectionRef()
      .where('companyId', '==', targetCompanyId)
      .orderBy('createdAt', 'desc')
      .get();

    let attendances = AttendanceEntity.fromFirestoreList(snapshot.docs);

    if (query.childId) {
      attendances = attendances.filter(
        (item) => item.childId === query.childId,
      );
    }

    if (query.collaboratorId) {
      attendances = attendances.filter(
        (item) =>
          item.collaboratorWhoCheckedInId === query.collaboratorId ||
          item.collaboratorWhoCheckedOutId === query.collaboratorId,
      );
    }

    if (query.activeOnly) {
      attendances = attendances.filter((item) => !item.checkOutTime);
    }

    if (query.from) {
      const fromDate = new Date(query.from);
      if (!Number.isNaN(fromDate.getTime())) {
        attendances = attendances.filter((item) => {
          if (!item.checkInTime) {
            return false;
          }
          return new Date(item.checkInTime) >= fromDate;
        });
      }
    }

    if (query.to) {
      const toDate = new Date(query.to);
      if (!Number.isNaN(toDate.getTime())) {
        attendances = attendances.filter((item) => {
          if (!item.checkInTime) {
            return false;
          }
          return new Date(item.checkInTime) <= toDate;
        });
      }
    }

    return attendances;
  }

  async findOne(
    attendanceId: string,
    companyId?: string,
    actorRoles?: string[],
  ) {
    const doc = await AttendanceEntity.docRef(attendanceId).get();
    if (!doc.exists) {
      throw new NotFoundException('Attendance not found');
    }

    const attendance = AttendanceEntity.fromFirestore(doc);

    if (companyId && actorRoles && !hasAdminPrivileges(actorRoles)) {
      if (attendance.companyId !== companyId) {
        throw new NotFoundException('Attendance not found');
      }
    }

    return attendance;
  }

  async update(
    attendanceId: string,
    updateAttendanceDto: UpdateAttendanceDto | UpdateAttendanceAdminDto,
    companyId: string,
    actorRoles: string[],
  ) {
    const isAdmin = hasAdminPrivileges(actorRoles);
    const docRef = AttendanceEntity.docRef(attendanceId);
    const doc = await docRef.get();

    if (!doc.exists) {
      throw new NotFoundException('Attendance not found');
    }

    const existing = AttendanceEntity.fromFirestore(doc);
    if (!isAdmin && existing.companyId !== companyId) {
      throw new NotFoundException('Attendance not found');
    }

    const payload: Partial<Attendance> = {
      ...updateAttendanceDto,
    };
    delete (payload as any).companyId;

    if (payload.notes) {
      payload.notes = payload.notes.trim();
    }

    const merged = new Attendance({
      ...existing,
      ...payload,
    });

    await docRef.update(AttendanceEntity.toFirestore(merged));
    const updated = await docRef.get();
    return AttendanceEntity.fromFirestore(updated);
  }

  async delete(attendanceId: string, companyId: string, actorRoles: string[]) {
    const isAdmin = hasAdminPrivileges(actorRoles);
    const doc = await AttendanceEntity.docRef(attendanceId).get();

    if (!doc.exists) {
      throw new NotFoundException('Attendance not found');
    }

    const attendance = AttendanceEntity.fromFirestore(doc);
    if (!isAdmin && attendance.companyId !== companyId) {
      throw new NotFoundException('Attendance not found');
    }

    await AttendanceEntity.docRef(attendanceId).delete();
  }

  private resolveTargetCompanyId(
    isAdmin: boolean,
    actorCompanyId: string,
    payloadCompanyId?: string,
  ) {
    if (isAdmin) {
      if (!payloadCompanyId) {
        throw new BadRequestException('companyId is required for admin action');
      }
      return payloadCompanyId;
    }

    return actorCompanyId;
  }

  private activeLockRef(companyId: string, childId: string) {
    const lockId = `${encodeURIComponent(companyId)}__${encodeURIComponent(childId)}`;
    return admin
      .firestore()
      .collection(Collections.ATTENDANCE_ACTIVE_LOCKS)
      .doc(lockId);
  }

  private async getChildFromCompany(childId: string, companyId: string) {
    const doc = await ChildEntity.docRef(childId).get();
    if (!doc.exists) {
      throw new NotFoundException('Child not found');
    }

    const child = ChildEntity.fromFirestore(doc);
    if (child.companyId !== companyId) {
      throw new NotFoundException('Child not found');
    }

    return child;
  }

  private async findActiveAttendance(childId: string, companyId: string) {
    const snapshot = await AttendanceEntity.collectionRef()
      .where('companyId', '==', companyId)
      .where('childId', '==', childId)
      .orderBy('createdAt', 'desc')
      .get();

    const attendances = AttendanceEntity.fromFirestoreList(snapshot.docs);
    return attendances.find((item) => !item.checkOutTime);
  }

  private async findActiveAttendanceInTransaction(
    tx: FirebaseFirestore.Transaction,
    childId: string,
    companyId: string,
  ) {
    const query = AttendanceEntity.collectionRef()
      .where('companyId', '==', companyId)
      .where('childId', '==', childId)
      .orderBy('createdAt', 'desc');

    const snapshot = await tx.get(query);
    const attendances = AttendanceEntity.fromFirestoreList(
      snapshot.docs as any,
    );
    return attendances.find((item) => !item.checkOutTime);
  }

  private normalizeDocument(document: string) {
    return String(document || '').replace(/\D/g, '');
  }

  private async confirmResponsibleByDocument(
    parentIds: string[],
    responsibleDocument: string,
  ) {
    if (!parentIds.length) {
      throw new BadRequestException('Child has no linked responsibles');
    }

    const normalizedDocument = this.normalizeDocument(responsibleDocument);
    if (!normalizedDocument) {
      throw new BadRequestException('Responsible document is required');
    }

    const parentDocs = await Promise.all(
      parentIds.map((parentId) => ParentEntity.docRef(parentId).get()),
    );

    const parents = parentDocs
      .filter((doc) => doc.exists)
      .map((doc) => ParentEntity.fromFirestore(doc));

    const matched = parents.find(
      (parent) =>
        this.normalizeDocument(parent.document || '') === normalizedDocument,
    );

    if (!matched) {
      throw new BadRequestException(
        'Responsible CPF does not match child records',
      );
    }

    return matched.id;
  }

  private async confirmResponsibleByDocumentInTransaction(
    tx: FirebaseFirestore.Transaction,
    parentIds: string[],
    responsibleDocument: string,
  ) {
    if (!parentIds.length) {
      throw new BadRequestException('Child has no linked responsibles');
    }

    const normalizedDocument = this.normalizeDocument(responsibleDocument);
    if (!normalizedDocument) {
      throw new BadRequestException('Responsible document is required');
    }

    const parentDocs = await Promise.all(
      parentIds.map((parentId) => tx.get(ParentEntity.docRef(parentId))),
    );

    const parents = parentDocs
      .filter((doc) => doc.exists)
      .map((doc) => ParentEntity.fromFirestore(doc));

    const matched = parents.find(
      (parent) =>
        this.normalizeDocument(parent.document || '') === normalizedDocument,
    );

    if (!matched) {
      throw new BadRequestException(
        'Responsible CPF does not match child records',
      );
    }

    return matched.id;
  }
}
