import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateParentDto } from './create-parent.dto';

class UpdateParentBaseDto extends OmitType(CreateParentDto, [
  'companyId',
] as const) {}

export class UpdateParentDto extends PartialType(UpdateParentBaseDto) {}
