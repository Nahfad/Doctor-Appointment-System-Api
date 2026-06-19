import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { Attendance } from './attendance.entity';
import { AttendanceService } from './attendance.service';
import { AttendanceController } from './attendance.controller';
import { AuthRolesGuard } from 'src/Auth/guards/auth.roles.guard';
import { Users } from 'src/users/users.entity';
import { UsersService } from 'src/users/users.service';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Attendance, Users]),
    JwtModule.register({}),
    ConfigModule,
    CloudinaryModule,
  ],
  controllers: [AttendanceController],
  providers: [AttendanceService, AuthRolesGuard, UsersService],
  exports: [AttendanceService],
})
export class AttendanceModule {}
