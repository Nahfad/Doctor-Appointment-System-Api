import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { VisitService } from './visit.service';
import { VisitController } from './visit.controller';
import { Visit } from './visit.entity';
import { Prescription } from 'src/visit/prescription/prescription.entity';
import { Patient } from 'src/patient/patient.entity';
import { Appointment } from 'src/appointment/appointment.entity';
import { Users } from 'src/users/users.entity';
import { AuthRolesGuard } from 'src/Auth/guards/auth.roles.guard';
import { UsersService } from 'src/users/users.service';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Visit, Prescription, Patient, Appointment, Users]),
    JwtModule.register({}),
    ConfigModule,
    CloudinaryModule,
  ],
  controllers: [VisitController],
  providers: [VisitService, AuthRolesGuard, UsersService],
  exports: [VisitService],
})
export class VisitModule { }