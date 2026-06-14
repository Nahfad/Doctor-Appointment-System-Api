import { IsString, Length } from 'class-validator';

export class CreatePrescriptionDto {

    @IsString()
    @Length(1, 200)
    medicineName: string;

    @IsString()
    @Length(1, 100)
    dosage: string;

    @IsString()
    @Length(1, 100)
    duration: string;

    @IsString()
    instructions: string;
}