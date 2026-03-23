import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateCollaboratorDto } from './create-collaborator.dto';

class UpdateCollaboratorBaseDto extends OmitType(CreateCollaboratorDto, [
  'companyId',
] as const) {}

export class UpdateCollaboratorDto extends PartialType(
  UpdateCollaboratorBaseDto,
) {}
