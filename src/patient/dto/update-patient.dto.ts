import {
    IsEnum, IsInt, IsOptional,
    IsString, Length, Max, Min, Matches,
} from 'class-validator';
import { Type } from 'class-transformer';
import { Gender } from 'src/utils/enums';

export class UpdatePatientDto {

    @IsOptional()
    @IsString()
    @Length(3, 100)
    name?: string;

    @IsOptional()
    @IsString()
    @Matches(/^(\+20|0)?1[0125]\d{8}$/, {
        message: 'phone must be a valid Egyptian phone number',
    })
    phone?: string;

    @IsOptional()
    @IsInt()
    @Min(0)
    @Max(150)
    @Type(() => Number)
    age?: number;

    @IsOptional()
    @IsEnum(Gender)
    gender?: Gender;

    @IsOptional()
    @IsString()
    @Length(0, 500)
    address?: string;

    @IsOptional()
    @IsString()
    @Length(0, 1000)
    notes?: string;
}