import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { CompanyEntity } from './entities/company.entity';
import { Company } from 'src/models/company.model';
import { FindCompaniesQueryDto } from 'src/company/dto/find-companies-query.dto';
import { UpdateCompanyAdminDto } from 'src/company/dto/update-company-admin.dto';
import { Address } from 'src/models/address.model';
import { Role } from 'src/constants/roles';

@Injectable()
export class CompanyService {
  async findAll(query: FindCompaniesQueryDto) {
    const { companyId, active, verified, name } = query;

    if (companyId) {
      const company = await this.findOne(companyId);
      return [company];
    }

    let queryRef: FirebaseFirestore.Query =
      CompanyEntity.collectionRef().orderBy('createdAt', 'desc');

    if (active !== undefined) {
      queryRef = queryRef.where('active', '==', active);
    }

    if (verified !== undefined) {
      queryRef = queryRef.where('verified', '==', verified);
    }

    const snapshot = await queryRef.get();
    let companies = CompanyEntity.fromFirestoreList(snapshot.docs);

    if (name) {
      const normalizedName = name.trim().toLowerCase();
      companies = companies.filter((company) =>
        String(company.name || '')
          .toLowerCase()
          .includes(normalizedName),
      );
    }

    return companies;
  }

  async findOne(companyId: string) {
    const doc = await CompanyEntity.docRef(companyId).get();
    if (!doc.exists) throw new NotFoundException('Company not found');
    return CompanyEntity.fromFirestore(doc);
  }

  async updateMe(companyId: string, updateCompanyDto: UpdateCompanyDto) {
    return this.update(companyId, updateCompanyDto);
  }

  async updateByAdmin(
    routeCompanyId: string,
    updateCompanyDto: UpdateCompanyAdminDto,
  ) {
    return this.updateByActor(routeCompanyId, updateCompanyDto, [Role.ADMIN]);
  }

  async updateByActor(
    routeCompanyId: string,
    updateCompanyDto: UpdateCompanyAdminDto,
    actorRoles: string[],
  ) {
    const isAdmin = actorRoles.includes(Role.ADMIN);
    const payloadCompanyId = updateCompanyDto.companyId?.trim();

    if (isAdmin) {
      if (!payloadCompanyId) {
        throw new BadRequestException(
          'companyId is required for admin updates',
        );
      }

      if (payloadCompanyId !== routeCompanyId) {
        throw new BadRequestException(
          'companyId in body must match route companyId',
        );
      }
    }

    return this.update(routeCompanyId, updateCompanyDto);
  }

  private async update(
    companyId: string,
    updateCompanyDto: Partial<UpdateCompanyAdminDto>,
  ) {
    const docRef = CompanyEntity.docRef(companyId);
    const doc = await docRef.get();
    if (!doc.exists) throw new NotFoundException('Company not found');

    const existing = CompanyEntity.fromFirestore(doc);
    const normalizedUpdate = this.normalizeUpdatePayload(updateCompanyDto);

    const merged = Object.assign(new Company(existing), normalizedUpdate);

    const data = CompanyEntity.toFirestore(merged);
    await docRef.update(data);
    const updated = await docRef.get();
    return CompanyEntity.fromFirestore(updated);
  }

  private normalizeUpdatePayload(
    updateCompanyDto: Partial<UpdateCompanyAdminDto>,
  ) {
    const payload: Partial<Company> = {
      ...updateCompanyDto,
    };

    delete (payload as any).companyId;

    if (payload.email) {
      payload.email = payload.email.trim().toLowerCase();
    }

    if (payload.cnpj) {
      payload.cnpj = payload.cnpj.replace(/\D/g, '');
    }

    if (payload.address) {
      payload.address = this.normalizeAddress(payload.address);
    }

    return payload;
  }

  private normalizeAddress(address: Address) {
    return {
      ...address,
      state: address.state
        ? String(address.state).toUpperCase()
        : address.state,
    };
  }
}
