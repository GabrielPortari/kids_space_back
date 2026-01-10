import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsNotEmpty } from 'class-validator';

export class CreateCheckinDto {
    @ApiPropertyOptional({ type: String, description: 'Optional notes' })
    @IsOptional()
    @IsString()
    notes?: string;

    @ApiPropertyOptional({ type: String, description: 'Company id' })
    @IsString()
    companyId?: string;

    @ApiPropertyOptional({ type: String, description: 'Collaborator id who checked in' })
    @IsString()
    collaboratorCheckedInId?: string;

    @ApiProperty({ type: String, description: 'Child document id' })
    @IsString()
    @IsNotEmpty()
    childId: string;

    @ApiProperty({ type: String, description: 'Responsible document id' })
    @IsString()
    @IsNotEmpty()
    responsibleId: string;
}