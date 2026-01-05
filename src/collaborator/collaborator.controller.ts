import { Controller, Post, Body, Param, Put, Delete, Request } from '@nestjs/common';
import { CollaboratorService } from './collaborator.service';
import { CreateCollaboratorDto } from './dto/create-collaborator.dto';

@Controller('collaborator')
export class CollaboratorController {
  constructor(private readonly svc: CollaboratorService) {}

  @Post('register')
  async registerCollaborator(@Body() createCollaboratorDto: CreateCollaboratorDto) {
    return this.svc.createCollaborator(createCollaboratorDto);
  }
}
