import { Module } from '@nestjs/common';
import { CompanyService } from './company.service';
import { CompanyController } from './company.controller';
import { CompanyOwnerOrAdminGuard } from './guards/company-owner-or-admin.guard';

@Module({
  controllers: [CompanyController],
  providers: [CompanyService, CompanyOwnerOrAdminGuard],
})
export class CompanyModule {}
