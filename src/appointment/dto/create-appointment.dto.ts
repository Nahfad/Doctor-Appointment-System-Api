import { IsString, IsNumber, IsObject, IsNotEmpty, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class UserDataDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsNotEmpty()
    email: string;

    @IsString()
    @IsNotEmpty()
    phone: string;

    @IsString()
    image?: string;

    @IsObject()
    address?: {
        line1: string;
        line2: string;
    };
}

class DocDataDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsNotEmpty()
    email: string;

    @IsString()
    @IsNotEmpty()
    speciality: string;

    @IsString()
    degree: string;

    @IsString()
    experience: string;

    @IsString()
    about: string;

    @IsNumber()
    fees: number;

    @IsString()
    image: string;

    @IsObject()
    @IsNotEmpty()
    address: {
        line1: string;
        line2: string;
    };
}

export class CreateAppointmentDto {
    @IsString()
    @IsNotEmpty()
    userId: string;

    @IsNotEmpty()
    docId: number;

    @IsString()
    @IsNotEmpty()
    slotDate: string;

    @IsString()
    @IsNotEmpty()
    slotTime: string;

    @IsObject()
    @ValidateNested()
    @Type(() => UserDataDto)
    @IsNotEmpty()
    userData: UserDataDto;

    @IsObject()
    @ValidateNested()
    @Type(() => DocDataDto)
    @IsNotEmpty()
    docData: DocDataDto;

    @IsNumber()
    @IsNotEmpty()
    amount: number;

    @IsNumber()
    @IsNotEmpty()
    date: number;
}