import { UseGuards, Controller, Get, Post, Body, Param, Put, Delete, Request } from '@nestjs/common';
import { CollaboratorService } from './collaborator.service';
import { CreateCollaboratorDto } from './dto/create-collaborator.dto';
import { UpdateCollaboratorDto } from './dto/update-collaborator.dto';
import { FirebaseAuthGuard } from '../auth/firebase-auth.guard';

@Controller('collaborator')
export class CollaboratorController {
  constructor(private readonly svc: CollaboratorService) {}

}
