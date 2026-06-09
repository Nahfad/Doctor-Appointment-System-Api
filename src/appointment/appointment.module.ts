import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { Appointment } from './appointment.entity';
import { AppointmentService } from './appointment.service';
import { AppointmentController } from './appointment.controller';
import { AuthRolesGuard } from '../Auth/guards/auth.roles.guard';
import { Users } from '../users/users.entity';
import { UsersService } from 'src/users/users.service';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';
import { Patient } from 'src/patient/patient.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Appointment, Users, Patient]),
    JwtModule.register({}),
    ConfigModule, CloudinaryModule
  ],
  controllers: [AppointmentController],
  providers: [AppointmentService, AuthRolesGuard, UsersService],
  exports: [AppointmentService, TypeOrmModule],
})
export class AppointmentModule { }