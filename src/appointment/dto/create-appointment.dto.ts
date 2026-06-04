import {
    IsOptional,
    IsString,
    IsInt,
    Matches,
} from 'class-validator';

export class CreateAppointmentDto {

    @IsOptional()
    @IsString()
    reason?: string;

    // التاريخ بالشكل ده: "2025-06-20"
    @IsString()
    @Matches(/^\d{4}-\d{2}-\d{2}$/, {
        message: 'slotDate must be in format YYYY-MM-DD (e.g. 2025-06-20)',
    })
    slotDate: string;

    // الوقت بالشكل ده: "10:00" أو "14:30"
    @IsString()
    @Matches(/^([01]\d|2[0-3]):[0-5]\d$/, {
        message: 'slotTime must be in format HH:MM (e.g. 10:00 or 14:30)',
    })
    slotTime: string;

    @IsInt()
    doctorId: number;
}