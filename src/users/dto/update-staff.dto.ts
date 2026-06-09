import {
    IsEnum, IsInt, IsOptional,
    IsString, Length, Matches, Min, Max,
} from 'class-validator';
import { Type } from 'class-transformer';
import { DoctorSpeciality } from 'src/utils/enums';

export class UpdateStaffDto {

    @IsOptional()
    @IsString()
    @Length(3, 100)
    name?: string;

    @IsOptional()
    @IsString()
    @Matches(/^(\+20|0)?1[0125]\d{8}$/, {
        message: 'phone must be a valid Egyptian phone number',
    })
    phone?: string;

    // Doctor only
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