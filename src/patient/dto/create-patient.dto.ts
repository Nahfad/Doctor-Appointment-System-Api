import {
    IsEnum, IsInt, IsNotEmpty, IsOptional,
    IsString, Length, Max, Min, Matches,
} from 'class-validator';
import { Type } from 'class-transformer';
import { Gender } from 'src/utils/enums';

export class CreatePatientDto {

    @IsString()
    @IsNotEmpty()
    @Length(3, 100, { message: 'name must be between 3 and 100 characters' })
    name: string;

    @IsString()
    @IsNotEmpty()
    @Matches(/^(\+20|0)?1[0125]\d{8}$/, {
        message: 'phone must be a valid Egyptian phone number',
    })
    phone: string;

    @IsInt()
    @Min(0)
    @Max(150)
    @Type(() => Number)
    age: number;

    @IsEnum(Gender, {
        message: 'gender must be male, female, or other',
    })
    gender: Gender;

    @IsOptional()
    @IsString()
    @Length(0, 500)
    address?: string;

    @IsOptional()
    @IsString()
    @Length(0, 1000)
    notes?: string;
}