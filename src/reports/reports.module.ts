import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';
import { Patient } from 'src/patient/patient.entity';
import { Appointment } from 'src/appointment/appointment.entity';
import { Visit } from 'src/visit/visit.entity';
import { Users } from 'src/users/users.entity';
import { AuthRolesGuard } from 'src/Auth/guards/auth.roles.guard';
import { UsersService } from 'src/users/users.service';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Patient, Appointment, Visit, Users]),
    JwtModule.register({}),
    ConfigModule,
    CloudinaryModule,
  ],
  controllers: [ReportsController],
  providers: [ReportsService, AuthRolesGuard, UsersService],
})
export class ReportsModule {}