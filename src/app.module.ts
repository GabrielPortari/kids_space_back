import { Module } from '@nestjs/common';
import { AppService } from './app.service';
import { AdminModule } from './admin/admin.module';
import { FirebaseModule } from './firebase/firebase.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { RolesModule } from './roles/roles.module';
import { AttendanceModule } from './attendance/attendance.module';
import { ChildModule } from './child/child.module';
import { ParentModule } from './parent/parent.module';
import { CollaboratorModule } from './collaborator/collaborator.module';
import { CompanyModule } from './company/company.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    FirebaseModule.forRoot(),
    AuthModule,
    RolesModule,
    AdminModule,
    CompanyModule,
    CollaboratorModule,
    AttendanceModule,
    ChildModule,
    ParentModule,
  ],
  providers: [AppService],
})
export class AppModule {}
