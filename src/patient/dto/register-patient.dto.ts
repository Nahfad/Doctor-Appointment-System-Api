import { IsString, IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class RegisterPatientDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsEmail()
    email: string;

    @IsString()
    @MinLength(6)
    password: string;
}