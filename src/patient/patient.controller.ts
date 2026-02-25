import { Controller, Post, Get, Body, Request, UseGuards } from '@nestjs/common';
import { PatientService } from './patient.service';
import { RegisterPatientDto } from './dto/register-patient.dto';
import { LoginPatientDto } from './dto/login-patient.dto';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';

@Controller('api/patient')
export class PatientController {
  constructor(private readonly patientService: PatientService) {}

  // POST /api/patient/register (Public)
  @Post('register')
  async register(@Body() registerPatientDto: RegisterPatientDto) {
    return this.patientService.register(registerPatientDto);
  }

  // POST /api/patient/login (Public)
  @Post('login')
  async login(@Body() loginPatientDto: LoginPatientDto) {
    return this.patientService.login(loginPatientDto);
  }

}