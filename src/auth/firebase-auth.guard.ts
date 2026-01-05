import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import * as firebaseAdmin from 'firebase-admin';
import { Observable } from 'rxjs';

@Injectable()
export class FirebaseAuthGuard implements CanActivate {
    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const authHeader = request.headers?.authorization;
        if(!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new UnauthorizedException('No token provided.');
        }
        const token = authHeader.split(' ')[1];
        try{
            const decodedToken = await firebaseAdmin.auth().verifyIdToken(token);
            request.user = decodedToken;
            return true;
        }catch{
            throw new UnauthorizedException('Invalid token.');
        }
    }
}