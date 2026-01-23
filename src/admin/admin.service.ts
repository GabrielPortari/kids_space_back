import { Inject, Injectable } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { FirebaseService } from '../firebase/firebase.service';
import { CreateAdminDto } from './dto/create-admin.dto';
import { BaseModel } from '../models/base.model';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { AppBadRequestException, AppNotFoundException } from '../exceptions';

@Injectable()
export class AdminService {
    private adminCollection: admin.firestore.CollectionReference<admin.firestore.DocumentData>;
    constructor(private readonly firebaseService: FirebaseService,
        @Inject('FIRESTORE') private readonly firestore: admin.firestore.Firestore) {
        this.adminCollection = this.firestore.collection('admins');
    }

    async registerSystemAdmin(createAdminDto: CreateAdminDto) {
        if (!createAdminDto.password) throw new AppBadRequestException('password is required to create admin');

        const adminAuth = await this.firebaseService.createUser({
            displayName: createAdminDto.name ?? '',
            email: createAdminDto.email,
            password: createAdminDto.password,
        });

        if (createAdminDto.roles?.length) {
            await this.firebaseService.setCustomUserClaims(adminAuth.uid, { roles: createAdminDto.roles });
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
        if (!id) throw new AppBadRequestException('id is required to get admin');
        const adminDoc = await this.adminCollection.doc(id).get();
        if (!adminDoc.exists) throw new AppNotFoundException(`Admin with id ${id} not found`);
        return adminDoc.data();
    }

    async updateSystemAdmin(id: string, updateAdminDto: UpdateAdminDto) {
        if (!id) throw new AppBadRequestException('id is required to update admin');
        const adminDoc = await this.adminCollection.doc(id).get();
        if (!adminDoc.exists) throw new AppNotFoundException(`Admin with id ${id} not found`);

        // Prepare update for Firebase Auth (do not save password to Firestore)
        const authUpdate: any = {};
        if (updateAdminDto.password) authUpdate.password = updateAdminDto.password;
        if (updateAdminDto.email) authUpdate.email = updateAdminDto.email;
        if (updateAdminDto.name) authUpdate.displayName = updateAdminDto.name;
        if (updateAdminDto.phone) authUpdate.phoneNumber = updateAdminDto.phone;

        if (Object.keys(authUpdate).length) {
            await admin.auth().updateUser(id, authUpdate).catch((err) => {
                throw new AppBadRequestException(err.message || 'Failed to update auth user');
            });
        }

        // Update custom claims if roles provided
        if (updateAdminDto.roles) await this.firebaseService.setCustomUserClaims(id, { roles: updateAdminDto.roles });

        // Prepare Firestore update, removing sensitive fields
        const firestoreUpdate: any = { ...updateAdminDto };
        if (firestoreUpdate.password) delete firestoreUpdate.password;

        await this.adminCollection.doc(id).update(firestoreUpdate);
        const updatedAdminDoc = await this.adminCollection.doc(id).get();
        return updatedAdminDoc.data();
    }

    async deleteSystemAdmin(id: string) {
        if (!id) throw new AppBadRequestException('id is required to delete admin');
        const adminDoc = await this.adminCollection.doc(id).get();
        if (!adminDoc.exists) throw new AppNotFoundException(`Admin with id ${id} not found`);

        // Archive and delete admin doc in a transaction, then remove auth user.
        await this.firestore.runTransaction(async transaction => {
            const adminRef = this.adminCollection.doc(id);
            const adminDeletedRef = this.firestore.collection('admins_deleted').doc(id);
            transaction.set(adminDeletedRef, { deletedDate: admin.firestore.FieldValue.serverTimestamp() });
            transaction.delete(adminRef);
        });

        await this.firebaseService.deleteUser(id);
        return { message: `Admin with id ${id} deleted and archived in admins_deleted` };
    }
}
