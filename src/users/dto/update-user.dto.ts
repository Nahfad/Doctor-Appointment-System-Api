import {
    IsString,
    IsOptional,
    IsEmail,
    MinLength,
    IsObject,
    ValidateNested
} from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateUserDto {
    @IsString()
    @IsOptional()
    name?: string;

    @IsString()
    @IsOptional()
    phone?: string;

    @IsString()
    @IsOptional()
    gender?: string;

    @IsString()
    @IsOptional()
    dob?: string;

    @IsString()
    @IsOptional()
    image?: string;

    @IsObject()
    @IsOptional()
    address?: { line1?: string; line2?: string };
}