import { FirebaseService } from '../firebase/firebase.service';
import { LoginDto } from './dto/login.dto';
import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { SignupCompanyDto } from './dto/signup-company.dto';
import * as admin from 'firebase-admin';
import { CompanyEntity } from 'src/company/entities/company.entity';
import { Company } from 'src/models/company.model';
import { Address } from 'src/models/address.model';
import { Collections } from 'src/constants/collections';
import { Role } from 'src/constants/roles';

@Injectable()
export class AuthService {
  constructor(private readonly firebaseService: FirebaseService) {}

  async login({ email, password }: LoginDto) {
    try {
      const { idToken, refreshToken, expiresIn } =
        await this.firebaseService.signInWithEmailAndPassword(email, password);

      return { idToken, refreshToken, expiresIn };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw new UnauthorizedException('Invalid credentials');
      }

      throw error;
    }
  }

  async logout(token: string) {
    if (!token) throw new BadRequestException('id token is required to logout');
    const { uid } = await this.firebaseService.verifyIdToken(token);
    return await this.firebaseService.revokeRefreshTokens(uid);
  }

  async refreshAuthToken(refreshToken: string) {
    try {
      return await this.firebaseService.refreshAuthToken(refreshToken);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      throw error;
    }
  }

  async recoverPassword(email: string) {
    const normalizedEmail = email.trim().toLowerCase();
    try {
      await this.firebaseService.sendPasswordResetEmail(normalizedEmail);
    } catch (error) {
      // Avoid user enumeration: keep response identical for invalid/non-existent emails.
      if (!(error instanceof BadRequestException)) {
        throw error;
      }
    }

    return { message: 'E-mail de recuperação enviado com sucesso.' };
  }

  async signupCompany(dto: SignupCompanyDto) {
    const email = dto.email.trim().toLowerCase();
    const cnpj = this.normalizeCnpj(dto.cnpj);

    const uniquenessLocks = await this.acquireCompanySignupLocks(email, cnpj);
    let shouldReleaseLocks = true;

    try {
      let userRecord;
      try {
        userRecord = await this.firebaseService.createUser({
          email,
          password: dto.password,
          displayName: dto.name,
        });
      } catch (err) {
        if (this.isDuplicateEmailError(err)) {
          throw new ConflictException('Email já cadastrado');
        }
        throw err;
      }

      await this.firebaseService.setCustomUserClaims(userRecord.uid, {
        role: Role.COMPANY,
      });

      // persist company using CompanyEntity mapper (adds serverTimestamp via BaseModel)
      const companyModel = new Company({
        name: dto.name,
        legalName: dto.legalName,
        cnpj,
        website: dto.website,
        logoUrl: dto.logoUrl,
        email,
        contact: dto.contact,
        address: {
          address: dto.address.address,
          number: dto.address.number,
          complement: dto.address.complement,
          neighborhood: dto.address.neighborhood,
          city: dto.address.city,
          state: dto.address.state.toUpperCase(),
          zipcode: dto.address.zipcode,
        } as Address,
        verified: false,
        active: false,
      } as any);

      const companyData = CompanyEntity.toFirestore(companyModel as Company);

      try {
        await this.firebaseService.createDocument(
          Collections.COMPANIES,
          userRecord.uid,
          companyData,
        );
      } catch (err) {
        await this.firebaseService.deleteUser(userRecord.uid);
        throw err;
      }

      // sign in to return tokens; if signIn fails, rollback both firestore doc and auth user
      let tokens: any;
      try {
        tokens = await this.firebaseService.signInWithEmailAndPassword(
          email,
          dto.password,
        );
      } catch (err) {
        try {
          await admin
            .firestore()
            .collection(Collections.COMPANIES)
            .doc(userRecord.uid)
            .delete();
        } catch (e) {
          // ignore
        }
        await this.firebaseService.deleteUser(userRecord.uid);
        throw err;
      }

      shouldReleaseLocks = false;

      return {
        user: {
          uid: userRecord.uid,
          email,
          name: dto.name,
          role: Role.COMPANY,
        },
        ...tokens,
      };
    } finally {
      if (shouldReleaseLocks) {
        await this.releaseCompanySignupLocks(uniquenessLocks);
      }
    }
  }

  private normalizeCnpj(cnpj: string) {
    return cnpj.replace(/\D/g, '');
  }

  private async acquireCompanySignupLocks(email: string, cnpj: string) {
    const db = admin.firestore();
    const emailLockDocId = this.buildSignupLockDocId('email', email);
    const cnpjLockDocId = this.buildSignupLockDocId('cnpj', cnpj);

    const emailLockRef = db.collection(Collections.TOKENS).doc(emailLockDocId);
    const cnpjLockRef = db.collection(Collections.TOKENS).doc(cnpjLockDocId);

    await db.runTransaction(async (tx) => {
      const [emailLockDoc, cnpjLockDoc] = await Promise.all([
        tx.get(emailLockRef),
        tx.get(cnpjLockRef),
      ]);

      if (emailLockDoc.exists) {
        throw new ConflictException('Email já cadastrado');
      }

      if (cnpjLockDoc.exists) {
        throw new ConflictException('CNPJ já cadastrado');
      }

      const [companyByEmail, userByEmail, companyByCnpj] = await Promise.all([
        tx.get(
          db
            .collection(Collections.COMPANIES)
            .where('email', '==', email)
            .limit(1),
        ),
        tx.get(
          db.collection(Collections.USERS).where('email', '==', email).limit(1),
        ),
        tx.get(
          db
            .collection(Collections.COMPANIES)
            .where('cnpj', '==', cnpj)
            .limit(1),
        ),
      ]);

      if (!companyByCnpj.empty) {
        throw new ConflictException('CNPJ já cadastrado');
      }

      if (!companyByEmail.empty || !userByEmail.empty) {
        throw new ConflictException('Email já cadastrado');
      }

      tx.set(emailLockRef, {
        type: 'signup_company_email',
        value: email,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      tx.set(cnpjLockRef, {
        type: 'signup_company_cnpj',
        value: cnpj,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    });

    return { emailLockDocId, cnpjLockDocId };
  }

  private async releaseCompanySignupLocks(locks: {
    emailLockDocId: string;
    cnpjLockDocId: string;
  }) {
    const db = admin.firestore();
    await Promise.all([
      db.collection(Collections.TOKENS).doc(locks.emailLockDocId).delete(),
      db.collection(Collections.TOKENS).doc(locks.cnpjLockDocId).delete(),
    ]);
  }

  private buildSignupLockDocId(type: 'email' | 'cnpj', value: string) {
    const normalized = Buffer.from(value).toString('base64url');
    return `signup_company_${type}_${normalized}`;
  }

  private isDuplicateEmailError(error: unknown) {
    if (!(error instanceof BadRequestException)) return false;

    const response = error.getResponse();
    const message =
      typeof response === 'string'
        ? response
        : Array.isArray((response as any)?.message)
          ? (response as any).message.join(' ')
          : (response as any)?.message || error.message;

    return String(message).toLowerCase().includes('email');
  }
}
