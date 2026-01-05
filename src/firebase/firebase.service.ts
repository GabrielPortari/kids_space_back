import { Injectable } from "@nestjs/common";
import { CreateRequest } from "firebase-admin/lib/auth/auth-config";
import { UserRecord } from "firebase-admin/lib/auth/user-record";
import * as firebaseAdmin from 'firebase-admin';
import { FirebaseConfigService } from "./firebase-config-service";
import axios from "axios";

@Injectable()
export class FirebaseService {
    private readonly apiKey: string;
    constructor(firebaseConfig: FirebaseConfigService) {
        this.apiKey = firebaseConfig.apiKey;
    }

    async createUser(props: CreateRequest): Promise<UserRecord>{
        return await firebaseAdmin.auth().createUser(props);
    }

    async signInWithEmailAndPassword(email: string, password: string) {
        const url: string = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${this.apiKey}`;
        const response = this.sendPostRequest(url, {
            email,
            password,
            returnSecureToken: true,
        });
        return response;
    }
    private async sendPostRequest(url: string, body: any){
        const response = await axios.post(url, body, {
            headers: {
                'Content-Type': 'application/json',
            }
        });
        return response.data;
    }
}