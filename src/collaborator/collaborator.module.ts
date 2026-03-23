import { Module } from '@nestjs/common';
import { CollaboratorService } from './collaborator.service';
import { CollaboratorController } from './collaborator.controller';
import { CollaboratorOwnerOrAdminGuard } from './guards/collaborator-owner-or-admin.guard';

@Module({
  controllers: [CollaboratorController],
  providers: [CollaboratorService, CollaboratorOwnerOrAdminGuard],
})
export class CollaboratorModule {}
