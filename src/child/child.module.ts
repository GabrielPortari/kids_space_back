import { Module } from '@nestjs/common';
import { ChildService } from './child.service';
import { ChildController } from './child.controller';
import { ChildOwnerOrCompanyGuard } from './guards/child-owner-or-company.guard';

@Module({
  controllers: [ChildController],
  providers: [ChildService, ChildOwnerOrCompanyGuard],
})
export class ChildModule {}
