import { IsString, IsEmail, IsNotEmpty, MinLength, IsOptional, Length } from 'class-validator';

export class RegisterUserDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsString()
    @MinLength(6)
    password: string;

    @IsOptional()
    @IsString()
    @Length(11)
    phone : string

}