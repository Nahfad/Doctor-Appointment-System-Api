import { IsEmail, IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class LoginUserDto {
    @IsString()
    @IsOptional()
    name: string

    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsString()
    @IsNotEmpty()
    password: string;
}