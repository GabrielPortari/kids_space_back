import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateCollaboratorDto } from './dto/create-collaborator.dto';
import { UpdateCollaboratorDto } from './dto/update-collaborator.dto';
import { CollaboratorEntity } from './entities/collaborator.entity';
import { Collaborator } from '../models/collaborator.model';
import { FindCollaboratorsQueryDto } from './dto/find-collaborators-query.dto';
import { UpdateCollaboratorAdminDto } from './dto/update-collaborator-admin.dto';
import { Address } from '../models/address.model';
import { hasAdminPrivileges } from '../constants/roles';

@Injectable()
export class CollaboratorService {
  async create(
    createCollaboratorDto: CreateCollaboratorDto,
    actorCompanyId: string,
    actorRoles: string[],
  ) {
    const isAdmin = hasAdminPrivileges(actorRoles);
    const payloadCompanyId = createCollaboratorDto.companyId?.trim();

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

    const collaboratorModel = new Collaborator({
      companyId: targetCompanyId,
      name: createCollaboratorDto.name?.trim(),
      email: createCollaboratorDto.email
        ? createCollaboratorDto.email.trim().toLowerCase()
        : undefined,
      document: createCollaboratorDto.document
        ? createCollaboratorDto.document.trim()
        : undefined,
      contact: createCollaboratorDto.contact
        ? createCollaboratorDto.contact.trim()
        : undefined,
      address: createCollaboratorDto.address
        ? this.normalizeAddress(createCollaboratorDto.address)
        : undefined,
    } as any);

    const docRef = CollaboratorEntity.docRef();
    const data = CollaboratorEntity.toFirestore(collaboratorModel);

    await docRef.set(data);
    const created = await docRef.get();
    return CollaboratorEntity.fromFirestore(created);
  }

  async findAll(
    companyId: string,
    query: FindCollaboratorsQueryDto,
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

    const queryRef: FirebaseFirestore.Query = CollaboratorEntity.collectionRef()
      .where('companyId', '==', targetCompanyId)
      .orderBy('createdAt', 'desc');

    const snapshot = await queryRef.get();
    let collaborators = CollaboratorEntity.fromFirestoreList(snapshot.docs);

    if (query.name) {
      const normalizedName = query.name.trim().toLowerCase();
      collaborators = collaborators.filter((c) =>
        String(c.name || '')
          .toLowerCase()
          .includes(normalizedName),
      );
    }

    if (query.email) {
      const normalizedEmail = query.email.trim().toLowerCase();
      collaborators = collaborators.filter(
        (c) =>
          c.email && String(c.email).toLowerCase().includes(normalizedEmail),
      );
    }

    if (query.document) {
      const normalizedDocument = query.document.trim();
      collaborators = collaborators.filter(
        (c) => c.document && String(c.document).includes(normalizedDocument),
      );
    }

    return collaborators;
  }

  async findOne(
    collaboratorId: string,
    companyId?: string,
    actorRoles?: string[],
  ) {
    const doc = await CollaboratorEntity.docRef(collaboratorId).get();
    if (!doc.exists) throw new NotFoundException('Collaborator not found');

    const collaborator = CollaboratorEntity.fromFirestore(doc);

    if (companyId && actorRoles && !hasAdminPrivileges(actorRoles)) {
      if (collaborator.companyId !== companyId) {
        throw new NotFoundException('Collaborator not found');
      }
    }

    return collaborator;
  }

  async update(
    collaboratorId: string,
    updateCollaboratorDto: UpdateCollaboratorDto | UpdateCollaboratorAdminDto,
    companyId: string,
    actorRoles: string[],
  ) {
    const isAdmin = hasAdminPrivileges(actorRoles);

    const docRef = CollaboratorEntity.docRef(collaboratorId);
    const doc = await docRef.get();
    if (!doc.exists) throw new NotFoundException('Collaborator not found');

    const existing = CollaboratorEntity.fromFirestore(doc);

    if (!isAdmin && existing.companyId !== companyId) {
      throw new NotFoundException('Collaborator not found');
    }

    const normalizedUpdate = this.normalizeUpdatePayload(updateCollaboratorDto);
    const merged = Object.assign(new Collaborator(existing), normalizedUpdate);

    const data = CollaboratorEntity.toFirestore(merged);
    await docRef.update(data);
    const updated = await docRef.get();
    return CollaboratorEntity.fromFirestore(updated);
  }

  async delete(
    collaboratorId: string,
    companyId: string,
    actorRoles: string[],
  ) {
    const isAdmin = hasAdminPrivileges(actorRoles);

    const doc = await CollaboratorEntity.docRef(collaboratorId).get();
    if (!doc.exists) throw new NotFoundException('Collaborator not found');

    const collaborator = CollaboratorEntity.fromFirestore(doc);

    if (!isAdmin && collaborator.companyId !== companyId) {
      throw new NotFoundException('Collaborator not found');
    }

    await CollaboratorEntity.docRef(collaboratorId).delete();
  }

  private normalizeUpdatePayload(
    updateCollaboratorDto: Partial<
      UpdateCollaboratorDto | UpdateCollaboratorAdminDto
    >,
  ) {
    const payload: Partial<Collaborator> = {
      ...updateCollaboratorDto,
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
