import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateCompanyDto } from './create-company.dto';

class UpdateCompanyBaseDto extends OmitType(CreateCompanyDto, [
  'active',
  'verified',
] as const) {}

export class UpdateCompanyDto extends PartialType(UpdateCompanyBaseDto) {}
