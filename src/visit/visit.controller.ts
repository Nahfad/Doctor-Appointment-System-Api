import {
  Controller, Get, Post, Put, Delete,
  Body, Param, Query, ParseIntPipe,
  DefaultValuePipe, UseGuards,
} from '@nestjs/common';
import { VisitService } from './visit.service';
import { CreateVisitDto } from './dto/create-visit.dto';
import { UpdateVisitDto } from './dto/update-visit.dto';
import { Roles } from 'src/Auth/guards/decorators/user-role.decorator';
import { AuthRolesGuard } from 'src/Auth/guards/auth.roles.guard';
import { CurrentUser } from 'src/Auth/guards/decorators/current-user.decorator';
import { UserType } from 'src/utils/enums';
import { JWTPayloadType } from 'src/utils/types';

@Controller('api/visits')
@UseGuards(AuthRolesGuard)
export class VisitController {
  constructor(private readonly visitService: VisitService) { }

  // POST /api/visits  (Doctor only)
  @Post()
  @Roles(UserType.DOCTOR)
  public createVisit(
    @Body() dto: CreateVisitDto,
    @CurrentUser() payload: JWTPayloadType,
  ) {
    return this.visitService.createVisit(dto, payload);
  }

  // GET /api/visits?patientId=&doctorId=&page=1&limit=10  (All roles)
  @Get()
  @Roles(UserType.ADMIN, UserType.DOCTOR, UserType.RECEPTIONIST)
  public getAllVisits(
    @CurrentUser() payload: JWTPayloadType,
    @Query('patientId') patientId?: number,
    @Query('doctorId') doctorId?: number,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number = 1,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number = 10,
  ) {
    return this.visitService.getAllVisits(payload, patientId, doctorId, page, limit);
  }

  // GET /api/visits/:id  (All roles)
  @Get(':id')
  @Roles(UserType.ADMIN, UserType.DOCTOR, UserType.RECEPTIONIST)
  public getVisitById(@Param('id', ParseIntPipe) id: number) {
    return this.visitService.getVisitById(id);
  }

  // PUT /api/visits/:id  (Doctor — own visits, within 24h)
  @Put(':id')
  @Roles(UserType.DOCTOR)
  public updateVisit(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateVisitDto,
    @CurrentUser() payload: JWTPayloadType,
  ) {
    return this.visitService.updateVisit(id, dto, payload);
  }

  // DELETE /api/visits/:id  (Admin only — cascade deletes prescriptions)
  @Delete(':id')
  @Roles(UserType.ADMIN)
  public deleteVisit(@Param('id', ParseIntPipe) id: number) {
    return this.visitService.deleteVisit(id);
  }
}