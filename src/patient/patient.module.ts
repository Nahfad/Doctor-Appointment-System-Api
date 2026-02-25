import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { Patient } from './patient.entity';
import { PatientService } from './patient.service';
import { PatientController } from './patient.controller';
import { RolesGuard } from '../common/guards/roles.guard';

@Module({
  imports: [
    TypeOrmModule.forFeature([Patient]),
    JwtModule.register({}),
    ConfigModule,
  ],
  controllers: [PatientController],
  providers: [PatientService, RolesGuard],
  exports: [PatientService, TypeOrmModule],
})
export class PatientModule { }