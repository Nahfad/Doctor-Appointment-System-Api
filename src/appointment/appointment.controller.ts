import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  Param,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AppointmentService } from './appointment.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { AuthRolesGuard } from '../Auth/guards/auth.roles.guard';
import { UserType } from '../utils/enums';
import { Roles } from 'src/Auth/guards/decorators/user-role.decorator';
import { CurrentUser } from 'src/Auth/guards/decorators/current-user.decorator';

@Controller('api/appointments')
export class AppointmentController {
  constructor(private readonly appointmentService: AppointmentService) { }

  // POST /api/appointments/book - Book appointment (Patient only)
  @UseGuards(AuthRolesGuard)
  @Roles(UserType.User)
  @Post('book')
  public bookAppointment(@Body() createAppointmentDto: CreateAppointmentDto) {

  }

  // GET /api/appointments/all - Get all appointments (Admin only)
  // @Roles(UserType.ADMIN)
  // @Get('all')
  // async getAllAppointments() {
  // }

  // GET /api/appointments/current-user - Get patient's appointments (Patient only)
  @Get('current-user')
  @Roles(UserType.User)
  @UseGuards(AuthRolesGuard)
  public getMyAppointments(@CurrentUser() payload) {

  }

  // GET /api/appointments/available-slots - Get available slots for a doctor
  // Public or Patient can access
  @Get('available-slots')
  async getAvailableSlots(
    @Query('doctorId') doctorId: string,
    @Query('date') date: string,
  ) {
  }

  // GET /api/appointments/doctor/:doctorId - Get doctor appointments (Admin only)
  @Roles(UserType.ADMIN)
  @Get('doctor/:doctorId')
  async getDoctorAppointments(@Param('doctorId') doctorId: string) {
  }

  // GET /api/appointments/stats - Get statistics (Admin only)
  @Roles(UserType.ADMIN)
  @Get('stats')
  async getStatistics() {
  }

  // GET /api/appointments/:id - Get single appointment (Admin & Patient)
  @Roles(UserType.ADMIN, UserType.User)
  @Get(':id')
  async getAppointmentById(@Param('id') id: string) {
  }

  // PATCH /api/appointments/:id/cancel - Cancel appointment (Admin & Patient)
  @Roles(UserType.ADMIN, UserType.User)
  @Patch(':id/cancel')
  async cancelAppointment(@Param('id') id: string) {
  }

  // PATCH /api/appointments/:id/complete - Complete appointment (Admin only)
  @Roles(UserType.ADMIN)
  @Patch(':id/complete')
  async completeAppointment(@Param('id') id: string) {
  }

  // PATCH /api/appointments/:id/payment - Update payment status (Admin only)
  @Roles(UserType.ADMIN)
  @Patch(':id/payment')
  async updatePaymentStatus(
    @Param('id') id: string,
    @Body() body: { paid: boolean },
  ) {
  }
}