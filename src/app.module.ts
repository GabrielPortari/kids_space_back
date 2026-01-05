import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { FirebaseModule } from './firebase/firebase.module';
import { UserModule } from './users/user.module';
import { ChildrenModule } from './children/children.module';
import { CollaboratorModule } from './collaborator/collaborator.module';
import { CompanyModule } from './companies/company.module';
import { AdminModule } from './admin/admin.module';

@Module({
  imports: [FirebaseModule, UserModule, ChildrenModule, CollaboratorModule, CompanyModule, AdminModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
