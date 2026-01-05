import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { FirebaseModule } from './firebase/firebase.module';
import { UsersModule } from './users/users.module';
import { ChildrenModule } from './children/children.module';
import { CollaboratorsModule } from './collaborators/collaborators.module';
import { CompaniesModule } from './companies/companies.module';

@Module({
  imports: [FirebaseModule, UsersModule, ChildrenModule, CollaboratorsModule, CompaniesModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
