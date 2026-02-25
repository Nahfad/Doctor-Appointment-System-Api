import { IsEmail, IsString, IsNotEmpty } from 'class-validator';

export class LoginPatientDto {
    @IsEmail()
    email: string;

    @IsString()
    @IsNotEmpty()
    password: string;
}