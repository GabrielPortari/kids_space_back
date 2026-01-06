import { Controller, Post, Body, Param, Put, Delete, Request, UseGuards, Get } from '@nestjs/common';
import { CollaboratorService } from './collaborator.service';
import { CreateCollaboratorDto } from './dto/create-collaborator.dto';
import { FirebaseService } from 'src/firebase/firebase.service';
import { ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from 'src/auth/auth.guard';
import { IdToken } from 'src/auth/dto/id-token.decorator';

@Controller('collaborator')
export class CollaboratorController {
  constructor(private readonly service: CollaboratorService,
    private readonly firebaseService: FirebaseService
  ) {}

  @Post('register')
  async registerCollaborator(@Body() createCollaboratorDto: CreateCollaboratorDto) {
    return this.service.createCollaborator(createCollaboratorDto);
  }

  @Get('profile')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  async profile(@IdToken() token: string){
    return await this.firebaseService.verifyIdToken(token);
  }
}
