import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { CreateAdminDto } from './dto/create-admin.dto';
import { Admin } from '../models/admin.model';
import { UserType } from 'src/models/base-user.model';


@Injectable()
export class AdminService {
  private collection: admin.firestore.CollectionReference<admin.firestore.DocumentData>;

  constructor(@Inject('FIRESTORE') private readonly firestore: admin.firestore.Firestore) {
    this.collection = this.firestore.collection('admins');
  }

  async register(dto: CreateAdminDto) {

    //criar usuário no firebase auth
    const user = await admin.auth().createUser({
      email: dto.email,
      password: dto.password,
      phoneNumber: dto.phone,
      displayName: dto.name,
    });

    //definir custom claims (marcar como admin)
    await admin.auth().setCustomUserClaims(user.uid, {admin: true});

    //salvar dados do admin no firestore
    const adminData: Admin = {
      id: user.uid,
      userType: 'admin' as UserType,
      name: dto.name,
      email: dto.email,
      phone: dto.phone,
      photoUrl: dto.photoUrl,
    };
    await this.collection.doc(user.uid).set(adminData);

    //emissão de token para login
    const customToken = await admin.auth().createCustomToken(user.uid);

    return { uid: user.uid, customToken };
  }
}
