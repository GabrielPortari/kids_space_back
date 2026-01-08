import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { Company } from '../models/company.model';
import { BaseModel } from '../models/base.model';

@Injectable()
export class CompanyService {
  private collection: admin.firestore.CollectionReference<admin.firestore.DocumentData>;

  constructor(@Inject('FIRESTORE') private readonly firestore: admin.firestore.Firestore) {
    this.collection = this.firestore.collection('companies');
  }

  async createCompany(createCompanyDto: CreateCompanyDto): Promise<Company> {
    const docRef = this.collection.doc();
    const newCompany: Company = {
      id: docRef.id,
      fantasyName: createCompanyDto.fantasyName,
      legalName: createCompanyDto.legalName,
      document: createCompanyDto.document,
      website: createCompanyDto.website,
      addressNumber: createCompanyDto.addressNumber,
      addressComplement: createCompanyDto.addressComplement,
      neighborhood: createCompanyDto.neighborhood,
      city: createCompanyDto.city,
      state: createCompanyDto.state,
      zipCode: createCompanyDto.zipCode,
      phone: createCompanyDto.phone,
      email: createCompanyDto.email,
      logoUrl: createCompanyDto.logoUrl,
      status: createCompanyDto.status,
      address: createCompanyDto.address,
    };
    await docRef.set(newCompany);
    return newCompany;
  }
  async getCompanyById(id: string) {
    if (!id) throw new BadRequestException('id is required to get admin');
    const companyDoc = await this.collection.doc(id).get();
    if (!companyDoc.exists) {
      throw new NotFoundException(`Company with id ${id} not found`);
    }
    return companyDoc.data();
  }

  async updateCompany(id: string, updateCompanyDto: UpdateCompanyDto) {
    if (!id) throw new BadRequestException('id is required to update company');
    const companyDoc = await this.collection.doc(id).get();
    if (!companyDoc.exists) {
      throw new NotFoundException(`Company with id ${id} not found`);
    }
    const updatedData = {
      ...updateCompanyDto,
    };
    await this.collection.doc(id).update(updatedData);
    const updatedCompanyDoc = await this.collection.doc(id).get();
    return updatedCompanyDoc.data();
  }

  async deleteCompany(id: string) {
    if (!id) throw new BadRequestException('id is required to delete company');
    const companyDoc = await this.collection.doc(id).get();
    if (!companyDoc.exists) {
      throw new NotFoundException(`Company with id ${id} not found`);
    }
    await this.collection.doc(id).delete();
    return { message: `Company with id ${id} deleted successfully` };
  }
}