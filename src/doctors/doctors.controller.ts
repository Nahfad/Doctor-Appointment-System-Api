import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UploadedFile, UseGuards } from '@nestjs/common';
import { DoctorsService } from './doctors.service';
import { CreateDoctorDto } from './dto/create-doctor.dto';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Role } from 'src/common/enums/role.enum';

@Controller("api/doctor")
export class DoctorsController {
  constructor(
    private readonly doctorsService: DoctorsService,
    private readonly cloudinaryService: CloudinaryService
  ) { }

  // POST : ~/api/doctor/add-doctor

  @Post("add-doctor")
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)   
  @UseInterceptors(FileInterceptor('file'))
  create(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: CreateDoctorDto
  ) {
    return this.doctorsService.addDoctor(body, file);
  }

  // GET /api/doctor/all-doctors
  @Get('all-doctors')
  async getAllDoctors() {
    return this.doctorsService.getAllDoctors();
  }

}
