import { IsEnum, IsNumber, IsOptional, IsString, Length, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { DoctorSpeciality } from 'src/utils/enums';

export class UpdateDoctorDto {

    @IsOptional()
    @IsString()
    @Length(2, 100)
    name?: string;

    @IsOptional()
    @IsEnum(DoctorSpeciality, {
        message: `speciality must be one of: ${Object.values(DoctorSpeciality).join(', ')}`,
    })
    speciality?: DoctorSpeciality;

    @IsOptional()
    @IsNumber()
    @Min(0)
    @Type(() => Number)
    experienceYears?: number;

    @IsOptional()
    @IsString()
    @Length(2, 150)
    about?: string;

    @IsOptional()
    @IsNumber()
    @Min(0)
    @Type(() => Number)
    fees?: number;
}