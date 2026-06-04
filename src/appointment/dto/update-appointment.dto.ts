import { IsEnum } from 'class-validator';
import { AppointmentStatus } from 'src/utils/enums';

export class UpdateAppointmentStatusDto {
    @IsEnum(AppointmentStatus, {
        message: `status must be one of: pending, confirmed, cancelled, completed`,
    })
    status: AppointmentStatus;
}
