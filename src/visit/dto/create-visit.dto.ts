import {
    IsArray, IsDateString, IsInt,
    IsOptional, IsString, Length,
    ValidateNested, ArrayMinSize,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CreatePrescriptionDto } from './create-prescription.dto';

export class CreateVisitDto {

    @IsInt()
    patientId: number;

    @IsOptional()
    @IsInt()
    appointmentId?: number;

    @IsString()
    @Length(1, 1000)
    complaint: string;

    @IsString()
    @Length(1, 2000)
    diagnosis: string;

    @IsString()
    @Length(1, 2000)
    treatment: string;

    @IsOptional()
    @IsString()
    @Length(0, 1000)
    notes?: string;

    @IsOptional()
    @IsDateString()
    visitDate?: string;

    // لازم يكون فيه دواء واحد على الأقل
    @IsArray()
    @ArrayMinSize(1, { message: 'At least one prescription is required' })
    @ValidateNested({ each: true })
    @Type(() => CreatePrescriptionDto)
    prescriptions: CreatePrescriptionDto[];
}