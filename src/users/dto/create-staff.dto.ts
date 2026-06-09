import {
    IsEmail, IsEnum, IsInt, IsOptional,
    IsString, Length, Matches, Min, Max,
} from 'class-validator';
import { Type } from 'class-transformer';
import { UserType, DoctorSpeciality } from 'src/utils/enums';

export class CreateStaffDto {

    @IsString()
    @Length(3, 100)
    name: string;

    @IsEmail()
    email: string;

    @IsString()
    @Matches(/^(?=.*[A-Z])(?=.*\d).{8,}$/, {
        message: 'password must be at least 8 characters with 1 uppercase and 1 number',
    })
    password: string;

    @IsString()
    @Matches(/^(\+20|0)?1[0125]\d{8}$/, {
        message: 'phone must be a valid Egyptian phone number',
    })
    phone: string;

    @IsEnum([UserType.DOCTOR, UserType.RECEPTIONIST], {
        message: 'userType must be doctor or receptionist',
    })
    userType: UserType.DOCTOR | UserType.RECEPTIONIST;

    // Doctor only — إلزامية لو userType = doctor
    @IsOptional()
    @IsEnum(DoctorSpeciality)
    speciality?: DoctorSpeciality;

    @IsOptional()
    @IsInt()
    @Min(0)
    @Max(60)
    @Type(() => Number)
    experienceYears?: number;

    @IsOptional()
    @Type(() => Number)
    @Min(0)
    fees?: number;

    @IsOptional()
    @IsString()
    @Length(0, 500)
    about?: string;
}