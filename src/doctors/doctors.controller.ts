import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UploadedFile, UseGuards, ParseIntPipe, Query, DefaultValuePipe, Put } from '@nestjs/common';
import { DoctorsService } from './doctors.service';
import { CreateDoctorDto } from './dto/create-doctor.dto';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthRolesGuard } from 'src/Auth/guards/auth.roles.guard';
import { Roles } from 'src/Auth/guards/decorators/user-role.decorator'
import { DoctorSpeciality, UserType } from 'src/utils/enums';
import { UpdateDoctorDto } from './dto/update-doctor.dto';

@Controller("api/doctors")
export class DoctorsController {
  constructor(
    private readonly doctorsService: DoctorsService,
    private readonly cloudinaryService: CloudinaryService
  ) { }

  // POST : ~/api/doctors (Private - Only Admin)
  @Post()
  @Roles(UserType.ADMIN)
  @UseGuards(AuthRolesGuard)
  @UseInterceptors(FileInterceptor('file'))
  create(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: CreateDoctorDto
  ) {
    return this.doctorsService.addDoctor(body, file);
  }

  // GET : ~/api/doctors   (Public)
  @Get()
  getAllDoctors(
    @Query('page') page: number,
    @Query('limit') limit: number,
  ) {
    return this.doctorsService.getAllDoctors(
      Number(page) || 1,
      Number(limit) || 10,
    );
  }


  // GET /api/doctors/specialities  (Public)
  @Get('specialities')
  getSpecialities() {
    return this.doctorsService.getSpecialities();
  }

  // GET /api/doctors/by-speciality/:speciality?pageNumber=1&limit=10  (Public)
  @Get('by-speciality/:speciality')
  getDoctorsBySpeciality(
    @Param('speciality') speciality: DoctorSpeciality,
    @Query('pageNumber', new DefaultValuePipe(1), ParseIntPipe) pageNumber: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    return this.doctorsService.getDoctorsBySpeciality(speciality, pageNumber, limit);
  }

  // GET : ~/api/doctors/:id (Public)
  @Get(':id')
  async getDoctor(@Param('id', ParseIntPipe) id: number) {
    return this.doctorsService.getDoctor(id);
  }


  // PUT /api/doctors/:id  (Private - Admin only)
  @Put(':id')
  @Roles(UserType.ADMIN)
  @UseGuards(AuthRolesGuard)
  @UseInterceptors(FileInterceptor('file'))
  updateDoctor(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: UpdateDoctorDto,
  ) {
    return this.doctorsService.updateDoctor(id, dto, file);
  }

  // DELETE /api/doctors/:id  (Private - Admin only)
  @Delete(':id')
  @Roles(UserType.ADMIN)
  @UseGuards(AuthRolesGuard)
  deleteDoctor(@Param('id', ParseIntPipe) id: number) {
    return this.doctorsService.deleteDoctor(id);
  }

}
