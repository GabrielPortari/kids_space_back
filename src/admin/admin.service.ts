import { Inject, Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { FirebaseService } from 'src/firebase/firebase.service';
import { CreateAdminDto } from './dto/create-admin.dto';
import { BaseModel } from 'src/models/base.model';

@Injectable()
export class AdminService {
    private adminCollection: admin.firestore.CollectionReference<admin.firestore.DocumentData>;
    constructor(private readonly firebaseService: FirebaseService,
        @Inject('FIRESTORE') private readonly firestore: admin.firestore.Firestore) {
        this.adminCollection = this.firestore.collection('admins');
    }

    async registerSystemAdmin(createAdminDto: CreateAdminDto) {
        if(!createAdminDto.password) throw new BadRequestException('password is required to create admin');

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
            userType: createAdminDto.userType ?? 'systemAdmin',
            phone: createAdminDto.phone ?? '',
            email: createAdminDto.email,
            name: createAdminDto.name ?? '',
            roles: createAdminDto.roles ?? [],
        };

        const data = BaseModel.toFirestore(adminFS);
        await this.adminCollection.doc(adminAuth.uid).set(data);
        
        return adminFS;
    }

    
}
