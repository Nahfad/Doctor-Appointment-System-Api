import { IsString, Matches } from 'class-validator';

export class RescheduleAppointmentDto {

    @IsString()
    @Matches(/^\d{4}-\d{2}-\d{2}$/, {
        message: 'slotDate must be in format YYYY-MM-DD',
    })
    slotDate: string;

    @IsString()
    @Matches(/^([01]\d|2[0-3]):[0-5]\d$/, {
        message: 'slotTime must be in format HH:MM',
    })
    slotTime: string;
}