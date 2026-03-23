import { Module } from '@nestjs/common';
import { ParentService } from './parent.service';
import { ParentController } from './parent.controller';
import { ParentOwnerOrCompanyGuard } from './guards/parent-owner-or-company.guard';

@Module({
  controllers: [ParentController],
  providers: [ParentService, ParentOwnerOrCompanyGuard],
})
export class ParentModule {}
