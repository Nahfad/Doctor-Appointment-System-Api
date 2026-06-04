import { IsBoolean, IsDate, IsDateString, IsEmail, IsEnum, IsNotEmpty, IsNumber, IsObject, IsOptional, IsString, Length, Min, ValidateNested } from "class-validator";
import { Transform, Type } from 'class-transformer';
import { DoctorSpeciality } from "src/utils/enums";




export class CreateDoctorDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsNumber()
    @IsNotEmpty()
    experienceYears: number;

    @IsString()
    @IsNotEmpty()
    @Length(2, 200)
    about: string;

    @IsNumber()
    @Min(0)
    @Type(() => Number)
    fees: number;

    @IsEnum(DoctorSpeciality, {
        message: `speciality must be one of: General Practice, Cardiology, ...`
    })
    speciality: DoctorSpeciality


}
