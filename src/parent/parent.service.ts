import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateParentDto } from './dto/create-parent.dto';
import { UpdateParentDto } from './dto/update-parent.dto';
import { ParentEntity } from './entities/parent.entity';
import { User } from '../models/parent.model';
import { FindParentsQueryDto } from './dto/find-parents-query.dto';
import { UpdateParentAdminDto } from './dto/update-parent-admin.dto';
import { Address } from '../models/address.model';
import { hasAdminPrivileges } from '../constants/roles';

@Injectable()
export class ParentService {
  async create(
    createParentDto: CreateParentDto,
    actorCompanyId: string,
    actorRoles: string[],
  ) {
    const isAdmin = hasAdminPrivileges(actorRoles);
    const payloadCompanyId = createParentDto.companyId?.trim();

    let targetCompanyId: string;

    if (isAdmin) {
      if (!payloadCompanyId) {
        throw new BadRequestException(
          'companyId is required for admin creation',
        );
      }
      targetCompanyId = payloadCompanyId;
    } else {
      targetCompanyId = actorCompanyId;
    }

    const parentModel = new User({
      companyId: targetCompanyId,
      name: createParentDto.name?.trim(),
      email: createParentDto.email
        ? createParentDto.email.trim().toLowerCase()
        : undefined,
      document: createParentDto.document
        ? createParentDto.document.trim()
        : undefined,
      contact: createParentDto.contact
        ? createParentDto.contact.trim()
        : undefined,
      address: createParentDto.address
        ? this.normalizeAddress(createParentDto.address)
        : undefined,
      children: createParentDto.children || [],
    } as any);

    const docRef = ParentEntity.docRef();
    const data = ParentEntity.toFirestore(parentModel);

    await docRef.set(data);
    const created = await docRef.get();
    return ParentEntity.fromFirestore(created);
  }

  async findAll(
    companyId: string,
    query: FindParentsQueryDto,
    actorRoles: string[],
  ) {
    const isAdmin = hasAdminPrivileges(actorRoles);
    const queryCompanyId = query.companyId?.trim();

    let targetCompanyId = companyId;

    if (isAdmin) {
      if (queryCompanyId) {
        targetCompanyId = queryCompanyId;
      }
    } else {
      targetCompanyId = companyId;
    }

    let queryRef: FirebaseFirestore.Query = ParentEntity.collectionRef()
      .where('companyId', '==', targetCompanyId)
      .orderBy('createdAt', 'desc');

    const snapshot = await queryRef.get();
    let parents = ParentEntity.fromFirestoreList(snapshot.docs);

    if (query.name) {
      const normalizedName = query.name.trim().toLowerCase();
      parents = parents.filter((p) =>
        String(p.name || '')
          .toLowerCase()
          .includes(normalizedName),
      );
    }

    if (query.email) {
      const normalizedEmail = query.email.trim().toLowerCase();
      parents = parents.filter(
        (p) =>
          p.email && String(p.email).toLowerCase().includes(normalizedEmail),
      );
    }

    if (query.document) {
      const normalizedDocument = query.document.trim();
      parents = parents.filter(
        (p) => p.document && String(p.document).includes(normalizedDocument),
      );
    }

    return parents;
  }

  async findOne(parentId: string, companyId?: string, actorRoles?: string[]) {
    const doc = await ParentEntity.docRef(parentId).get();
    if (!doc.exists) throw new NotFoundException('Parent not found');

    const parent = ParentEntity.fromFirestore(doc);

    if (companyId && actorRoles && !hasAdminPrivileges(actorRoles)) {
      if (parent.companyId !== companyId) {
        throw new NotFoundException('Parent not found');
      }
    }

    return parent;
  }

  async update(
    parentId: string,
    updateParentDto: UpdateParentDto | UpdateParentAdminDto,
    companyId: string,
    actorRoles: string[],
  ) {
    const isAdmin = hasAdminPrivileges(actorRoles);

    const docRef = ParentEntity.docRef(parentId);
    const doc = await docRef.get();
    if (!doc.exists) throw new NotFoundException('Parent not found');

    const existing = ParentEntity.fromFirestore(doc);

    if (!isAdmin && existing.companyId !== companyId) {
      throw new NotFoundException('Parent not found');
    }

    const normalizedUpdate = this.normalizeUpdatePayload(updateParentDto);
    const merged = Object.assign(new User(existing), normalizedUpdate);

    const data = ParentEntity.toFirestore(merged);
    await docRef.update(data);
    const updated = await docRef.get();
    return ParentEntity.fromFirestore(updated);
  }

  async delete(parentId: string, companyId: string, actorRoles: string[]) {
    const isAdmin = hasAdminPrivileges(actorRoles);

    const doc = await ParentEntity.docRef(parentId).get();
    if (!doc.exists) throw new NotFoundException('Parent not found');

    const parent = ParentEntity.fromFirestore(doc);

    if (!isAdmin && parent.companyId !== companyId) {
      throw new NotFoundException('Parent not found');
    }

    await ParentEntity.docRef(parentId).delete();
  }

  private normalizeUpdatePayload(
    updateParentDto: Partial<UpdateParentDto | UpdateParentAdminDto>,
  ) {
    const payload: Partial<User> = {
      ...updateParentDto,
    };

    delete (payload as any).companyId;

    if (payload.email) {
      payload.email = payload.email.trim().toLowerCase();
    }

    if (payload.document) {
      payload.document = payload.document.trim();
    }

    if (payload.contact) {
      payload.contact = payload.contact.trim();
    }

    if (payload.address) {
      payload.address = this.normalizeAddress(payload.address as Address);
    }

    return payload;
  }

  private normalizeAddress(address: Address): Address {
    return {
      ...address,
      state: address.state
        ? String(address.state).toUpperCase()
        : address.state,
    };
  }
}
