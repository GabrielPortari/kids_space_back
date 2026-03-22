import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateChildDto } from './dto/create-child.dto';
import { UpdateChildDto } from './dto/update-child.dto';
import { ChildEntity } from './entities/child.entity';
import { User } from '../models/child.model';
import { FindChildrenQueryDto } from './dto/find-children-query.dto';
import { UpdateChildAdminDto } from './dto/update-child-admin.dto';
import { Address } from '../models/address.model';
import { hasAdminPrivileges } from '../constants/roles';

@Injectable()
export class ChildService {
  async create(
    createChildDto: CreateChildDto,
    actorCompanyId: string,
    actorRoles: string[],
  ) {
    const isAdmin = hasAdminPrivileges(actorRoles);
    const payloadCompanyId = createChildDto.companyId?.trim();

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

    const childModel = new User({
      companyId: targetCompanyId,
      name: createChildDto.name?.trim(),
      parents: createChildDto.parents || [],
      email: createChildDto.email
        ? createChildDto.email.trim().toLowerCase()
        : undefined,
      document: createChildDto.document
        ? createChildDto.document.trim()
        : undefined,
      contact: createChildDto.contact
        ? createChildDto.contact.trim()
        : undefined,
      address: createChildDto.address
        ? this.normalizeAddress(createChildDto.address)
        : undefined,
    } as any);

    const docRef = ChildEntity.docRef();
    const data = ChildEntity.toFirestore(childModel);

    await docRef.set(data);
    const created = await docRef.get();
    return ChildEntity.fromFirestore(created);
  }

  async findAll(
    companyId: string,
    query: FindChildrenQueryDto,
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

    const snapshot = await ChildEntity.collectionRef()
      .where('companyId', '==', targetCompanyId)
      .orderBy('createdAt', 'desc')
      .get();

    let children = ChildEntity.fromFirestoreList(snapshot.docs);

    if (query.name) {
      const normalizedName = query.name.trim().toLowerCase();
      children = children.filter((child) =>
        String(child.name || '')
          .toLowerCase()
          .includes(normalizedName),
      );
    }

    if (query.email) {
      const normalizedEmail = query.email.trim().toLowerCase();
      children = children.filter(
        (child) =>
          child.email &&
          String(child.email).toLowerCase().includes(normalizedEmail),
      );
    }

    if (query.document) {
      const normalizedDocument = query.document.trim();
      children = children.filter(
        (child) =>
          child.document && String(child.document).includes(normalizedDocument),
      );
    }

    if (query.parentId) {
      const parentId = query.parentId.trim();
      children = children.filter((child) => child.parents?.includes(parentId));
    }

    return children;
  }

  async findOne(childId: string, companyId?: string, actorRoles?: string[]) {
    const doc = await ChildEntity.docRef(childId).get();
    if (!doc.exists) {
      throw new NotFoundException('Child not found');
    }

    const child = ChildEntity.fromFirestore(doc);

    if (companyId && actorRoles && !hasAdminPrivileges(actorRoles)) {
      if (child.companyId !== companyId) {
        throw new NotFoundException('Child not found');
      }
    }

    return child;
  }

  async update(
    childId: string,
    updateChildDto: UpdateChildDto | UpdateChildAdminDto,
    companyId: string,
    actorRoles: string[],
  ) {
    const isAdmin = hasAdminPrivileges(actorRoles);

    const docRef = ChildEntity.docRef(childId);
    const doc = await docRef.get();
    if (!doc.exists) {
      throw new NotFoundException('Child not found');
    }

    const existing = ChildEntity.fromFirestore(doc);

    if (!isAdmin && existing.companyId !== companyId) {
      throw new NotFoundException('Child not found');
    }

    const normalizedUpdate = this.normalizeUpdatePayload(updateChildDto);
    const merged = Object.assign(new User(existing), normalizedUpdate);

    const data = ChildEntity.toFirestore(merged);
    await docRef.update(data);
    const updated = await docRef.get();
    return ChildEntity.fromFirestore(updated);
  }

  async delete(childId: string, companyId: string, actorRoles: string[]) {
    const isAdmin = hasAdminPrivileges(actorRoles);

    const doc = await ChildEntity.docRef(childId).get();
    if (!doc.exists) {
      throw new NotFoundException('Child not found');
    }

    const child = ChildEntity.fromFirestore(doc);

    if (!isAdmin && child.companyId !== companyId) {
      throw new NotFoundException('Child not found');
    }

    await ChildEntity.docRef(childId).delete();
  }

  private normalizeUpdatePayload(
    updateChildDto: Partial<UpdateChildDto | UpdateChildAdminDto>,
  ) {
    const payload: Partial<User> = {
      ...updateChildDto,
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
