import { Global, Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AuthGuard } from './dto/auth.guard';

@Global()
@Module({
    controllers: [AuthController],
    providers: [AuthService, AuthGuard],
})
export class AuthModule {}
