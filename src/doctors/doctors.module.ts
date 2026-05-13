import { Module } from '@nestjs/common';
import { DoctorsService } from './doctors.service';
import { DoctorsController } from './doctors.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Doctor } from './doctors.entity';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthRolesGuard } from '../Auth/guards/auth.roles.guard';
import { Users } from '../users/users.entity';
import { AuthGuard } from 'src/Auth/guards/auth.guard';
import { Appointment } from 'src/appointment/appointment.entity';
import { UserModule } from 'src/users/users.module';

@Module({
  controllers: [DoctorsController],
  providers: [DoctorsService],
  imports: [TypeOrmModule.forFeature([Doctor, Users, Appointment] ,  ),
  JwtModule.registerAsync({
    imports: [ConfigModule],
    inject: [ConfigService],
    useFactory: (config: ConfigService) => ({
      secret: config.get<string>('JWT_SECRET'),
      signOptions: {
        expiresIn: config.get<string>('JWT_EXPIRES_IN') as any,
      },
    }),
  }), CloudinaryModule , ConfigModule , UserModule],
  exports: [DoctorsService],
})
export class DoctorsModule { }
