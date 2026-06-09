import { IsInt, IsOptional, IsString, Matches } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateAppointmentDto {

    @IsInt()
    @Type(() => Number)
    patientId: number;

    @IsInt()
    @Type(() => Number)
    doctorId: number;

    // "2025-06-20"
    @IsString()
    @Matches(/^\d{4}-\d{2}-\d{2}$/, {
        message: 'slotDate must be in format YYYY-MM-DD',
    })
    slotDate: string;

    // "10:00"
    @IsString()
    @Matches(/^([01]\d|2[0-3]):[0-5]\d$/, {
        message: 'slotTime must be in format HH:MM',
    })
    slotTime: string;

    @IsOptional()
    @IsString()
    reason?: string;
}