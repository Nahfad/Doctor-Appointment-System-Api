import {
  Controller, Get, Post, Patch, Delete, Put,
  Body, Param, Query, ParseIntPipe,
  DefaultValuePipe, UseGuards,
} from '@nestjs/common';
import { AppointmentService } from './appointment.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentStatusDto } from './dto/update-appointment-status.dto';
import { RescheduleAppointmentDto } from './dto/reschedule-appointment.dto';
import { Roles } from 'src/Auth/guards/decorators/user-role.decorator';
import { AuthRolesGuard } from 'src/Auth/guards/auth.roles.guard';
import { CurrentUser } from 'src/Auth/guards/decorators/current-user.decorator';
import { UserType, AppointmentStatus } from 'src/utils/enums';
import { JWTPayloadType } from 'src/utils/types';

@Controller('api/appointments')
@UseGuards(AuthRolesGuard)
export class AppointmentController {
  constructor(private readonly appointmentService: AppointmentService) { }

  // ─── Dashboard ───────────────────────────────────────────

  // GET /api/appointments/dashboard/stats  (Admin & Receptionist)
  @Get('dashboard/stats')
  @Roles(UserType.ADMIN, UserType.RECEPTIONIST)
  public getStats() {
    return this.appointmentService.getStats();
  }

  // GET /api/appointments/dashboard/latest  (Admin & Receptionist)
  @Get('dashboard/latest')
  @Roles(UserType.ADMIN, UserType.RECEPTIONIST)
  public getLatestAppointments() {
    return this.appointmentService.getLatestAppointments();
  }

  // ─── CRUD ────────────────────────────────────────────────

  // POST /api/appointments  (Admin & Receptionist)
  @Post()
  @Roles(UserType.ADMIN, UserType.RECEPTIONIST)
  public createAppointment(
    @Body() dto: CreateAppointmentDto,
    @CurrentUser() payload: JWTPayloadType,
  ) {
    return this.appointmentService.createAppointment(dto, payload);
  }

  // GET /api/appointments?patientId=&doctorId=&status=&date=&page=1&limit=10
  // Admin & Receptionist: كل المواعيد
  // Doctor: مواعيده بس
  @Get()
  @Roles(UserType.ADMIN, UserType.RECEPTIONIST, UserType.DOCTOR)
  public getAllAppointments(
    @CurrentUser() payload: JWTPayloadType,
    @Query('patientId') patientId?: number,
    @Query('doctorId') doctorId?: number,
    @Query('status') status?: AppointmentStatus,
    @Query('date') date?: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number = 1,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number = 10,
  ) {
    return this.appointmentService.getAllAppointments(
      payload, patientId, doctorId, status, date, page, limit,
    );
  }

  // GET /api/appointments/:id  (All roles)
  @Get(':id')
  @Roles(UserType.ADMIN, UserType.RECEPTIONIST, UserType.DOCTOR)
  public getAppointmentById(@Param('id', ParseIntPipe) id: number) {
    return this.appointmentService.getAppointmentById(id);
  }

  // PATCH /api/appointments/:id/status  (All roles — rules enforced in service)
  @Patch(':id/status')
  @Roles(UserType.ADMIN, UserType.RECEPTIONIST, UserType.DOCTOR)
  public updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateAppointmentStatusDto,
    @CurrentUser() payload: JWTPayloadType,
  ) {
    return this.appointmentService.updateStatus(id, dto, payload);
  }

  // PUT /api/appointments/:id/reschedule  (Admin & Receptionist)
  @Put(':id/reschedule')
  @Roles(UserType.ADMIN, UserType.RECEPTIONIST)
  public rescheduleAppointment(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: RescheduleAppointmentDto,
    @CurrentUser() payload: JWTPayloadType,
  ) {
    return this.appointmentService.rescheduleAppointment(id, dto, payload);
  }

  // DELETE /api/appointments/:id  (Admin only)
  @Delete(':id')
  @Roles(UserType.ADMIN)
  public deleteAppointment(@Param('id', ParseIntPipe) id: number) {
    return this.appointmentService.deleteAppointment(id);
  }
}