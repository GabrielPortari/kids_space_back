import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString, IsNotEmpty, IsDateString } from 'class-validator';

export class CreateAttendanceDto {
    @ApiProperty({ enum: ['checkin', 'checkout'], required: false })
    @IsOptional()
    @IsIn(['checkin', 'checkout'])
    attendanceType?: 'checkin' | 'checkout';

    @ApiProperty({ enum: ['open', 'closed'], required: false })
    @IsOptional()
    @IsIn(['open', 'closed'])
    status?: 'open' | 'closed';

    @ApiPropertyOptional({ type: String, description: 'Optional notes' })
    @IsOptional()
    @IsString()
    notes?: string;

    @ApiPropertyOptional({ type: String, description: 'Collaborator id who checked in' })
    @IsOptional()
    @IsString()
    collaboratorCheckedInId?: string;

    @ApiPropertyOptional({ type: String, description: 'Collaborator id who checked out' })
    @IsOptional()
    @IsString()
    collaboratorCheckedOutId?: string;

    @ApiProperty({ type: String, description: 'Child document id' })
    @IsString()
    @IsNotEmpty()
    childId: string;

    @ApiProperty({ type: String, description: 'Responsible document id' })
    @IsString()
    @IsNotEmpty()
    responsibleId: string;

    @ApiPropertyOptional({ type: String, format: 'date-time', description: 'ISO8601 check-in time' })
    @IsOptional()
    @IsDateString()
    checkInTime?: string;

    @ApiPropertyOptional({ type: String, format: 'date-time', description: 'ISO8601 check-out time' })
    @IsOptional()
    @IsDateString()
    checkOutTime?: string;

    @ApiPropertyOptional({ type: String, format: 'date-time', description: 'Alias: time the child was checked in' })
    @IsOptional()
    @IsDateString()
    timeCheckedIn?: string;
}