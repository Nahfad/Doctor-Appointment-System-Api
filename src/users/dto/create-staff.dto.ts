import { IsEmail, IsEnum, IsString, Length, Matches } from 'class-validator';
import { UserType } from 'src/utils/enums';

export class CreateStaffDto {

    @IsString()
    @Length(2, 100)
    name: string;

    @IsEmail()
    email: string;

    // Password: minimum 8 chars, at least 1 uppercase, 1 number
    @IsString()
    @Matches(/^(?=.*[A-Z])(?=.*\d).{8,}$/, {
        message: 'password must be at least 8 characters with 1 uppercase and 1 number',
    })
    password: string;

    // الادمن بيختار هل بيعمل حساب دكتور ولا ريسبشن
    @IsEnum([UserType.DOCTOR, UserType.RECEPTIONIST], {
        message: 'userType must be either doctor or receptionist',
    })
    userType: UserType.DOCTOR | UserType.RECEPTIONIST;
}