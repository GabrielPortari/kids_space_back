import { FirebaseService } from "src/firebase/firebase.service";
import { LoginDto } from "./dto/login.dto";

export class AuthService{
    constructor(private readonly firebaseService: FirebaseService) {}

    async login({email, password}: LoginDto){
        const {
            idToken, 
            refreshToken, 
            expiresIn
        } = await this.firebaseService.signInWithEmailAndPassword(email, password);
        
        return {idToken, refreshToken, expiresIn};
    }
}