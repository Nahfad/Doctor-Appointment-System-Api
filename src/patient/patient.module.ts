import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { PatientService } from './patient.service';
import { PatientController } from './patient.controller';
import { Patient } from './patient.entity';
import { Users } from 'src/users/users.entity';
import { AuthRolesGuard } from 'src/Auth/guards/auth.roles.guard';
import { UsersService } from 'src/users/users.service';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Patient, Users]),
    JwtModule.register({}),
    ConfigModule,
    CloudinaryModule,
  ],
  controllers: [PatientController],
  providers: [PatientService, AuthRolesGuard, UsersService],
  exports: [PatientService],
})
export class PatientModule {}