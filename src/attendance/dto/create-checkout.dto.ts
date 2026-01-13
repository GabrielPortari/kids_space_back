import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString, IsNotEmpty, IsDateString } from 'class-validator';

export class CreateCheckoutDto {
    @ApiPropertyOptional({ type: String, description: 'Optional notes' })
    @IsOptional()
    @IsString()
    notes?: string;
    
    @ApiPropertyOptional({ type: String, description: 'Company id' })
    @IsString()
    companyId?: string;

    @ApiPropertyOptional({ type: String, description: 'Collaborator id who checked out' })
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
}