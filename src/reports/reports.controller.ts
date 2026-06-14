import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { ReportFilterDto } from './dto/report-filter.dto';
import { Roles } from 'src/Auth/guards/decorators/user-role.decorator';
import { AuthRolesGuard } from 'src/Auth/guards/auth.roles.guard';
import { UserType } from 'src/utils/enums';

@Controller('api/reports')
@Roles(UserType.ADMIN)
@UseGuards(AuthRolesGuard)
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) { }

  // GET /api/reports/patients?startDate=&endDate=  (Admin only)
  @Get('patients')
  public getPatientsReport(@Query() filter: ReportFilterDto) {
    return this.reportsService.getPatientsReport(filter);
  }

  // GET /api/reports/appointments?startDate=&endDate=&doctorId=  (Admin only)
  @Get('appointments')
  public getAppointmentsReport(@Query() filter: ReportFilterDto) {
    return this.reportsService.getAppointmentsReport(filter);
  }

  // GET /api/reports/doctors?startDate=&endDate=  (Admin only)
  @Get('doctors')
  public getDoctorsReport(@Query() filter: ReportFilterDto) {
    return this.reportsService.getDoctorsReport(filter);
  }

  // GET /api/reports/visits?startDate=&endDate=&patientId=  (Admin only)
  @Get('visits')
  public getVisitsReport(@Query() filter: ReportFilterDto) {
    return this.reportsService.getVisitsReport(filter);
  }
}