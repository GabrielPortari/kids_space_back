import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { AdminEntity } from './entities/admin.entity';
import { Admin } from '../models/admin.model';
import { FindAdminsQueryDto } from './dto/find-admins-query.dto';

@Injectable()
export class AdminService {
  async create(createAdminDto: CreateAdminDto) {
    const model = new Admin({
      name: createAdminDto.name?.trim(),
      email: createAdminDto.email?.trim().toLowerCase(),
      document: createAdminDto.document?.trim(),
      contact: createAdminDto.contact?.trim(),
      address: createAdminDto.address
        ? this.normalizeAddress(createAdminDto.address)
        : undefined,
      active: createAdminDto.active ?? true,
    });

    const docRef = AdminEntity.docRef();
    await docRef.set(AdminEntity.toFirestore(model));
    const created = await docRef.get();
    return AdminEntity.fromFirestore(created);
  }

  async findAll(query: FindAdminsQueryDto) {
    let queryRef: FirebaseFirestore.Query = AdminEntity.collectionRef().orderBy(
      'createdAt',
      'desc',
    );

    if (query.active !== undefined) {
      queryRef = queryRef.where('active', '==', query.active);
    }

    const snapshot = await queryRef.get();
    let admins = AdminEntity.fromFirestoreList(snapshot.docs);

    if (query.name) {
      const normalized = query.name.trim().toLowerCase();
      admins = admins.filter((admin) =>
        String(admin.name || '')
          .toLowerCase()
          .includes(normalized),
      );
    }

    if (query.email) {
      const normalized = query.email.trim().toLowerCase();
      admins = admins.filter((admin) =>
        String(admin.email || '')
          .toLowerCase()
          .includes(normalized),
      );
    }

    if (query.document) {
      const normalized = query.document.trim();
      admins = admins.filter((admin) =>
        String(admin.document || '').includes(normalized),
      );
    }

    return admins;
  }

  async findOne(adminId: string) {
    const doc = await AdminEntity.docRef(adminId).get();
    if (!doc.exists) {
      throw new NotFoundException('Admin not found');
    }
    return AdminEntity.fromFirestore(doc);
  }

  async update(adminId: string, updateAdminDto: UpdateAdminDto) {
    const docRef = AdminEntity.docRef(adminId);
    const doc = await docRef.get();
    if (!doc.exists) {
      throw new NotFoundException('Admin not found');
    }

    const existing = AdminEntity.fromFirestore(doc);

    if (
      updateAdminDto.name !== undefined &&
      !String(updateAdminDto.name).trim()
    ) {
      throw new BadRequestException('name cannot be empty');
    }

    const payload: Partial<Admin> = {
      ...updateAdminDto,
    };

    if (payload.name !== undefined) {
      payload.name = payload.name.trim();
    }

    if (payload.email !== undefined) {
      payload.email = payload.email.trim().toLowerCase();
    }

    if (payload.document !== undefined) {
      payload.document = payload.document.trim();
    }

    if (payload.contact !== undefined) {
      payload.contact = payload.contact.trim();
    }

    if (payload.address) {
      payload.address = this.normalizeAddress(payload.address);
    }

    const merged = new Admin({
      ...existing,
      ...payload,
    });

    await docRef.update(AdminEntity.toFirestore(merged));
    const updated = await docRef.get();
    return AdminEntity.fromFirestore(updated);
  }

  private normalizeAddress(address: any) {
    if (!address) return undefined;
    return {
      ...address,
      state: address.state
        ? String(address.state).toUpperCase()
        : address.state,
    };
  }

  async remove(adminId: string) {
    const docRef = AdminEntity.docRef(adminId);
    const doc = await docRef.get();
    if (!doc.exists) {
      throw new NotFoundException('Admin not found');
    }

    await docRef.delete();
  }
}
