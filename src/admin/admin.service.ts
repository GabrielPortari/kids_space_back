import { Inject, Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { FirebaseService } from 'src/firebase/firebase.service';
import { CreateAdminDto } from './dto/create-admin.dto';
import { BaseModel } from 'src/models/base.model';
import { UpdateAdminDto } from './dto/update-admin.dto';

@Injectable()
export class AdminService {
    private adminCollection: admin.firestore.CollectionReference<admin.firestore.DocumentData>;
    constructor(private readonly firebaseService: FirebaseService,
        @Inject('FIRESTORE') private readonly firestore: admin.firestore.Firestore) {
        this.adminCollection = this.firestore.collection('admins');
    }

    async registerSystemAdmin(createAdminDto: CreateAdminDto) {
        if (!createAdminDto.password) throw new BadRequestException('password is required to create admin');

        const adminAuth = await this.firebaseService.createUser({
            displayName: createAdminDto.name ?? '',
            email: createAdminDto.email,
            password: createAdminDto.password,
        });

        if (createAdminDto.roles?.length) {
            await this.firebaseService.setCustomUserClaims(adminAuth.uid, {
                roles: createAdminDto.roles
            });
        }

        const adminFS = {
            id: adminAuth.uid,
            userType: createAdminDto.userType,
            status: createAdminDto.status,
            phone: createAdminDto.phone,
            email: createAdminDto.email,
            name: createAdminDto.name,
            roles: createAdminDto.roles,
        };

        const data = BaseModel.toFirestore(adminFS);
        await this.adminCollection.doc(adminAuth.uid).set(data);

        return adminFS;
    }

    async getAdminById(id: string) {
        if (!id) throw new BadRequestException('id is required to get admin');
        const adminDoc = await this.adminCollection.doc(id).get();
        if (!adminDoc.exists) {
            throw new NotFoundException(`Admin with id ${id} not found`);
        }
        return adminDoc.data();
    }

    async updateSystemAdmin(id: string, updateAdminDto: UpdateAdminDto) {
        if (!id) throw new BadRequestException('id is required to update admin');
        const adminDoc = await this.adminCollection.doc(id).get();
        if (!adminDoc.exists) {
            throw new NotFoundException(`Admin with id ${id} not found`);
        }
        const updatedData = {
            ...updateAdminDto,
        };
        await this.adminCollection.doc(id).update(updatedData);
        const updatedAdminDoc = await this.adminCollection.doc(id).get();
        return updatedAdminDoc.data();
    }

    async deleteSystemAdmin(id: string) {
        if (!id) throw new BadRequestException('id is required to delete admin');
        const adminDoc = await this.adminCollection.doc(id).get();
        if (!adminDoc.exists) {
            throw new NotFoundException(`Admin with id ${id} not found`);
        }
        await this.firebaseService.deleteUser(id);
        await this.adminCollection.doc(id).delete();
        return { message: `Admin with id ${id} deleted successfully` };
    }

}
