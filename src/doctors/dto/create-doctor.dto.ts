import { IsBoolean, IsDate, IsDateString, IsEmail, IsEnum, IsNotEmpty, IsNumber, IsObject, IsOptional, IsString, Length, Min, ValidateNested } from "class-validator";
import { Transform, Type } from 'class-transformer';




export class CreateDoctorDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsNotEmpty()
    speciality: string;

    @IsNumber()
    @IsNotEmpty()
    experienceYears: number;

    @IsString()
    @IsNotEmpty()
    @Length(2, 150)
    about: string;

    @IsNumber()
    @Min(0)
    @Type(() => Number)
    fees: number;



}
