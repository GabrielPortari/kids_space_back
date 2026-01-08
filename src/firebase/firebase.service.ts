import { BadRequestException, Injectable } from "@nestjs/common";
import { CreateRequest } from "firebase-admin/lib/auth/auth-config";
import { UserRecord } from "firebase-admin/lib/auth/user-record";
import * as firebaseAdmin from 'firebase-admin';
import { FirebaseConfigService } from "./firebase-config-service";
import axios from "axios";
import { DecodedIdToken } from "firebase-admin/lib/auth/token-verifier";

@Injectable()
export class FirebaseService {
    private readonly apiKey: string;
    constructor(firebaseConfig: FirebaseConfigService) {
        this.apiKey = firebaseConfig.apiKey;
    }

    async createUser(props: CreateRequest): Promise<UserRecord>{
        return await firebaseAdmin.auth().createUser(props).catch(this.handleFirebaseAuthError) as UserRecord;
    }

    async deleteUser(uid: string): Promise<void>{
        return await firebaseAdmin.auth().deleteUser(uid).catch(this.handleFirebaseAuthError);
    }

    async verifyIdToken(idToken: string, checkRevoked = false): Promise<DecodedIdToken>{
        return await firebaseAdmin.auth().verifyIdToken(idToken, checkRevoked).catch(this.handleFirebaseAuthError) as DecodedIdToken;
    }

    async signInWithEmailAndPassword(email: string, password: string) {
        const url: string = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${this.apiKey}`;
        const response = this.sendPostRequest(url, {
            email,
            password,
            returnSecureToken: true,
        }).catch(this.handleRestApiError);
        return response;
    }

    async refreshAuthToken(refreshToken: string) {
        const{
            id_token: idToken,
            refresh_token: newRefreshToken,
            expires_in: expiresIn,
        } = await this.sendRefreshAuthTokenRequest(refreshToken).catch(this.handleRestApiError);

        return {
            idToken, 
            refreshToken: newRefreshToken, 
            expiresIn
        };
    }

    private async sendRefreshAuthTokenRequest(refreshToken: string){
        const url: string = `https://securetoken.googleapis.com/v1/token?key=${this.apiKey}`;
        const payload = {
            grant_type: 'refresh_token',
            refresh_token: refreshToken
        };
        return await this.sendPostRequest(url, payload);
    }

    async revokeRefreshTokens(uid: string){
        return await firebaseAdmin.auth().revokeRefreshTokens(uid).catch(this.handleFirebaseAuthError);
    }

    private async sendPostRequest(url: string, body: any){
        const response = await axios.post(url, body, {
            headers: {
                'Content-Type': 'application/json',
            }
        });
        return response.data;
    }

    private handleFirebaseAuthError(error: any){
        if(error.code?.startsWith('auth/')){
            throw new BadRequestException(error.message);
        }
        throw new Error(error.message);
    }

    private handleRestApiError(error: any){
        if(error.response?.data?.error?.code === 400){
            const messageKey = error.response?.data?.error?.message;
            const message = {
                INVALIDD_TOKEN_CREDENTIALS: 'Invalid login credentials',
                INVALID_REFRESH_TOKEN: 'Invalid refresh token',
                TOKEN_EXPIRED: 'Token expired',
                USER_DISABLED: 'User disabled',
            }[messageKey] ?? messageKey;
            throw new BadRequestException(message);
        }
        throw new Error(error.message);
    }

    async setCustomUserClaims(uid: string, claims: Record<string, any>){
        return await firebaseAdmin.auth().setCustomUserClaims(uid, claims);
    }

    async createDocument(collection: string, id: string, data: any){
        return await firebaseAdmin.firestore().collection(collection).doc(id).set(data);
    }
}