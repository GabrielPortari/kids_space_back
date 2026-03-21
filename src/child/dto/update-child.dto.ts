import { PartialType } from '@nestjs/swagger';
import { OmitType } from '@nestjs/swagger';
import { CreateChildDto } from './create-child.dto';

class UpdateChildBaseDto extends OmitType(CreateChildDto, [
  'companyId',
] as const) {}

export class UpdateChildDto extends PartialType(UpdateChildBaseDto) {}
