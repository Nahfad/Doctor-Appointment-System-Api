import { IsDateString, IsInt, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class ReportFilterDto {

    @IsOptional()
    @IsDateString()
    startDate?: string;

    @IsOptional()
    @IsDateString()
    endDate?: string;

    @IsOptional()
    @IsInt()
    @Type(() => Number)
    doctorId?: number;

    @IsOptional()
    @IsInt()
    @Type(() => Number)
    patientId?: number;
}