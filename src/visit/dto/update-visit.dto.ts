import {
    IsArray, IsDateString, IsOptional,
    IsString, Length, ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CreatePrescriptionDto } from './create-prescription.dto';

export class UpdateVisitDto {

    @IsOptional()
    @IsString()
    @Length(1, 1000)
    complaint?: string;

    @IsOptional()
    @IsString()
    @Length(1, 2000)
    diagnosis?: string;

    @IsOptional()
    @IsString()
    @Length(1, 2000)
    treatment?: string;

    @IsOptional()
    @IsString()
    @Length(0, 1000)
    notes?: string;

    @IsOptional()
    @IsDateString()
    visitDate?: string;

    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreatePrescriptionDto)
    prescriptions?: CreatePrescriptionDto[];
}