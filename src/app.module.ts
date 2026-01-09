import { Module } from '@nestjs/common';
import { AppService } from './app.service';
import { AdminModule } from './admin/admin.module';
import { FirebaseModule } from './firebase/firebase.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { CollaboratorModule } from './collaborator/collaborator.module';
import { RolesModule } from './roles/roles.module';
import { UserModule } from './users/user.module';
import { CompanyModule } from './companies/company.module';
import { ChildrenModule } from './children/children.module';
import { AttendanceModule } from './attendance/attendance.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    FirebaseModule.forRoot(),
    AuthModule,
    RolesModule,
    AdminModule,
    CompanyModule,
    CollaboratorModule,
    UserModule,
    ChildrenModule,
    AttendanceModule,
  ],
  providers: [AppService],
})
export class AppModule {}
