import { UseGuards, Controller, Get, Post, Body, Param, Put, Delete, Request } from '@nestjs/common';
import { CollaboratorsService } from './collaborators.service';
import { CreateCollaboratorDto } from './dto/create-collaborator.dto';
import { UpdateCollaboratorDto } from './dto/update-collaborator.dto';
import { FirebaseAuthGuard } from '../auth/firebase-auth.guard';
@Controller('collaborators')
export class CollaboratorsController {
  constructor(private readonly svc: CollaboratorsService) {}

}
