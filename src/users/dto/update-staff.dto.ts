import { IsOptional, IsString, Length, Matches } from 'class-validator';

export class UpdateStaffDto {

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
    @IsString()
    specialization?: string;
}