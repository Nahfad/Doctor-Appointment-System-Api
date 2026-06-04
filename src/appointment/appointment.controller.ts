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
  Delete,
  ParseIntPipe,
} from '@nestjs/common';
import { AppointmentService } from './appointment.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentStatusDto } from './dto/update-appointment.dto';
import { AuthRolesGuard } from '../Auth/guards/auth.roles.guard';
import { UserType } from '../utils/enums';
import { Roles } from 'src/Auth/guards/decorators/user-role.decorator';
import { CurrentUser } from 'src/Auth/guards/decorators/current-user.decorator';
import { dot } from 'node:test/reporters';
import { JWTPayloadType } from 'src/utils/types';

@Controller('api/appointments')
export class AppointmentController {
  constructor(private readonly appointmentService: AppointmentService) { }

  // POST /api/appointments - Book appointment (Patient only)
  @UseGuards(AuthRolesGuard)
  @Roles(UserType.User)
  @Post()
  public createAppointment(@Body() dto: CreateAppointmentDto, @CurrentUser() payload: JWTPayloadType) {
    return this.appointmentService.createAppointment(dto, payload.id)
  }

  // GET /api/appointments/all - Get all appointments (Admin only)
  @UseGuards(AuthRolesGuard)
  @Roles(UserType.ADMIN)
  @Get('all')
  async getAllAppointments(
    @Query('pageNumber', ParseIntPipe) pageNumber: number,
    @Query('appointmentPerPage', ParseIntPipe) appointmentPerPage: number

  ) {
    return this.appointmentService.getAllAppointments(pageNumber, appointmentPerPage)
  }

  // GET /api/appointments/stats  (Admin only)
  @Get('/stats')
  @Roles(UserType.ADMIN)
  @UseGuards(AuthRolesGuard)
  public getStats() {
    return this.appointmentService.getStats();
  }

  // GET /api/appointments/latest  (Admin only)
  @Get('/latest')
  @Roles(UserType.ADMIN)
  @UseGuards(AuthRolesGuard)
  public getLatestAppointments() {
    return this.appointmentService.getLatestAppointments();
  }

  // GET /api/appointments/current-user - Get patient's appointments (Patient only) 
  @Get('current-user')
  @Roles(UserType.User)
  @UseGuards(AuthRolesGuard)
  public getMyAppointment(@CurrentUser() payload: JWTPayloadType) {
    return this.appointmentService.getMyAppointment(payload.id)
  }

  // GET : ~ /api/appointments/:id  -  Get a single appointments by its ID
  @Get(':id')
  public getAppointmentBy(@Param('id', ParseIntPipe) id: number) {
    return this.appointmentService.getAppointmentBy(id);
  }


  // PATCH /api/appointments/:id/status - Update appointment status (Admin only)
  @Patch(':id/status')
  @Roles(UserType.ADMIN)
  @UseGuards(AuthRolesGuard)
  public updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateAppointmentStatusDto,
  ) {
    return this.appointmentService.updateStatus(id, dto.status);
  }

  // Delete /api/appointments/:id - delate appointments private (Admin and patinet)
  @Delete(':id')
  @Roles(UserType.ADMIN, UserType.User)
  @UseGuards(AuthRolesGuard)
  public async deleteAppointment(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() payload: JWTPayloadType
  ) {
    return this.appointmentService.deleteAppointment(id, payload);
  }


}