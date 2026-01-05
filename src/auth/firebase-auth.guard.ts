import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import * as firebaseAdmin from 'firebase-admin';
import { Observable } from 'rxjs';

@Injectable()
export class FirebaseAuthGuard implements CanActivate {
    async canActivate(context: ExecutionContext) {
        const request = context.switchToHttp().getRequest();
        const authHeader = (request.headers.authorization || '').split(' ')[1];
        
        if(!authHeader) {
            throw new UnauthorizedException('No token provided.');
        }

        let decodedToken;
        try{
            decodedToken = await firebaseAdmin.auth().verifyIdToken(authHeader);
        }catch{
            throw new UnauthorizedException('Invalid token.');
        }

        // checar claim admin
        if(!decodedToken.admin){
            throw new UnauthorizedException('Insufficient permissions.');
        }

        request.user = decodedToken;
        return true;
    }
}