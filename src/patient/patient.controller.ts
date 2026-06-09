import {
  Controller, Get, Post, Put, Delete,
  Body, Param, Query, ParseIntPipe,
  DefaultValuePipe, UseGuards,
} from '@nestjs/common';
import { PatientService } from './patient.service';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';
import { Roles } from 'src/Auth/guards/decorators/user-role.decorator';
import { AuthRolesGuard } from 'src/Auth/guards/auth.roles.guard';
import { UserType, Gender } from 'src/utils/enums';

@Controller('api/patients')
@UseGuards(AuthRolesGuard)
export class PatientController {
  constructor(private readonly patientService: PatientService) { }

  // POST /api/patients  (Admin & Receptionist)
  @Post()
  @Roles(UserType.ADMIN, UserType.RECEPTIONIST)
  public createPatient(@Body() dto: CreatePatientDto) {
    return this.patientService.createPatient(dto);
  }

  // GET /api/patients  (All roles)
  @Get()
  @Roles(UserType.ADMIN, UserType.DOCTOR, UserType.RECEPTIONIST)
  public getAllPatients(
    @Query('search') search?: string,
    @Query('gender') gender?: Gender,
    @Query('sortBy') sortBy?: string,
    @Query('order') order: 'ASC' | 'DESC' = 'DESC',
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number = 1,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number = 10,
  ) {
    return this.patientService.getAllPatients(search, gender, sortBy, order, page, limit);
  }

  // GET /api/patients/:id  (All roles)
  @Get(':id')
  @Roles(UserType.ADMIN, UserType.DOCTOR, UserType.RECEPTIONIST)
  public getPatientById(@Param('id', ParseIntPipe) id: number) {
    return this.patientService.getPatientById(id);
  }

  // PUT /api/patients/:id  (Admin & Receptionist)
  @Put(':id')
  @Roles(UserType.ADMIN, UserType.RECEPTIONIST)
  public updatePatient(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdatePatientDto,
  ) {
    return this.patientService.updatePatient(id, dto);
  }

  // DELETE /api/patients/:id  (Admin only — Soft Delete)
  @Delete(':id')
  @Roles(UserType.ADMIN)
  public deletePatient(@Param('id', ParseIntPipe) id: number) {
    return this.patientService.deletePatient(id);
  }
}