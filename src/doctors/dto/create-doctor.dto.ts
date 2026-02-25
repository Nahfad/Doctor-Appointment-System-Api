import { IsBoolean, IsDate, IsDateString, IsEmail, IsEnum, IsNotEmpty, IsNumber, IsObject, IsOptional, IsString, Length, Min, ValidateNested } from "class-validator";
import { Transform, Type } from 'class-transformer';


class AddressDto {
    @IsString()
    @IsNotEmpty()
    line1: string;

    @IsString()
    @IsNotEmpty()
    line2: string;

}


export class CreateDoctorDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsString()
    @IsNotEmpty()
    password: string;

    @IsString()
    @IsNotEmpty()
    speciality: string;

    @IsString()
    @IsNotEmpty()
    degree: string;

    @IsString()
    @IsNotEmpty()
    experience: string;

    @IsString()
    @IsNotEmpty()
    @Length(2, 150)
    about: string;

    @IsNumber()
    @Min(0)
    @Type(() => Number)
    fees: number;

    @IsObject()
    @Transform(({ value }) => typeof value === 'string' ? JSON.parse(value) : value)
    address: object;

}
