import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  ParseIntPipe,
  DefaultValuePipe,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { Roles } from 'src/Auth/guards/decorators/user-role.decorator';
import { AuthRolesGuard } from 'src/Auth/guards/auth.roles.guard';
import { CurrentUser } from 'src/Auth/guards/decorators/current-user.decorator';
import { UserType } from 'src/utils/enums';
import { JWTPayloadType } from 'src/utils/types';

@Controller('api/attendance')
@UseGuards(AuthRolesGuard)
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  // POST /api/attendance/check-in  (Doctor only)
  @Post('check-in')
  @Roles(UserType.DOCTOR)
  public checkIn(@CurrentUser() currentUser: JWTPayloadType) {
    return this.attendanceService.checkIn(currentUser.id);
  }

  // POST /api/attendance/check-out  (Doctor only)
  @Post('check-out')
  @Roles(UserType.DOCTOR)
  public checkOut(@CurrentUser() currentUser: JWTPayloadType) {
    return this.attendanceService.checkOut(currentUser.id);
  }

  // GET /api/attendance/report  (Admin only)
  @Get('report')
  @Roles(UserType.ADMIN)
  public getReport(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('doctorId') doctorId?: number,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number = 1,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number = 10,
  ) {
    return this.attendanceService.getReport(
      startDate,
      endDate,
      doctorId ? Number(doctorId) : undefined,
      page,
      limit,
    );
  }

  // GET /api/attendance/doctor/:id  (Admin & own Doctor)
  @Get('doctor/:id')
  @Roles(UserType.ADMIN, UserType.DOCTOR)
  public getDoctorAttendance(
    @CurrentUser() currentUser: JWTPayloadType,
    @Param('id', ParseIntPipe) id: number,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number = 1,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number = 10,
  ) {
    if (currentUser.userType === UserType.DOCTOR && currentUser.id !== id) {
      throw new ForbiddenException('You can only view your own attendance');
    }

    return this.attendanceService.getDoctorAttendance(
      id,
      page,
      limit,
      startDate,
      endDate,
    );
  }
}
