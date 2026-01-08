import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AdminModule } from './admin/admin.module';
import { FirebaseModule } from './firebase/firebase.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { CollaboratorModule } from './collaborator/collaborator.module';
import { RolesModule } from './roles/roles.module';
import { User } from './models/user.model';
import { UserModule } from './users/user.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    FirebaseModule.forRoot(),
    AuthModule,
    AdminModule,
    CollaboratorModule,
    UserModule,
    RolesModule,
  ],
  providers: [AppService],
})
export class AppModule {}
