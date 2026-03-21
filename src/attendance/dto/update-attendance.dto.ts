import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateAttendanceDto } from './create-attendance.dto';

class UpdateAttendanceBaseDto extends OmitType(CreateAttendanceDto, [
  'companyId',
] as const) {}

export class UpdateAttendanceDto extends PartialType(UpdateAttendanceBaseDto) {}
