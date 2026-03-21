import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { CompanyEntity } from './entities/company.entity';
import { Company } from 'src/models/company.model';
import { UpdateCompanyComplianceDto } from './dto/update-company-compliance.dto';

@Injectable()
export class CompanyService {
  async findAll() {
    const snapshot = await CompanyEntity.collectionRef()
      .orderBy('createdAt', 'desc')
      .get();
    return snapshot.docs.map((d) => CompanyEntity.fromFirestore(d));
  }

  async findOne(id: string) {
    const doc = await CompanyEntity.docRef(id).get();
    if (!doc.exists) throw new NotFoundException('Company not found');
    return CompanyEntity.fromFirestore(doc);
  }

  async update(id: string, updateCompanyDto: UpdateCompanyDto) {
    const docRef = CompanyEntity.docRef(id);
    const doc = await docRef.get();
    if (!doc.exists) throw new NotFoundException('Company not found');

    const existing = CompanyEntity.fromFirestore(doc);
    const merged = Object.assign(
      new Company(existing),
      updateCompanyDto as any,
    );
    const data = CompanyEntity.toFirestore(merged);
    await docRef.update(data);
    const updated = await docRef.get();
    return CompanyEntity.fromFirestore(updated);
  }

  async remove(id: string) {
    const docRef = CompanyEntity.docRef(id);
    const doc = await docRef.get();
    if (!doc.exists) throw new NotFoundException('Company not found');
    await docRef.delete();
    return { id };
  }

  async updateCompliance(
    id: string,
    updateComplianceDto: UpdateCompanyComplianceDto,
  ) {
    const docRef = CompanyEntity.docRef(id);
    const doc = await docRef.get();
    if (!doc.exists) throw new NotFoundException('Company not found');

    const existing = CompanyEntity.fromFirestore(doc);
    const merged = Object.assign(new Company(existing), {
      active:
        updateComplianceDto.active === undefined
          ? existing.active
          : updateComplianceDto.active,
      verified:
        updateComplianceDto.verified === undefined
          ? existing.verified
          : updateComplianceDto.verified,
    });

    const data = CompanyEntity.toFirestore(merged);
    await docRef.update(data);
    const updated = await docRef.get();
    return CompanyEntity.fromFirestore(updated);
  }
}
