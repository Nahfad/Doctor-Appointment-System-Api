import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UploadedFile, UseGuards } from '@nestjs/common';
import { DoctorsService } from './doctors.service';
import { CreateDoctorDto } from './dto/create-doctor.dto';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthRolesGuard } from 'src/Auth/guards/auth.roles.guard';
import { Roles } from 'src/Auth/guards/decorators/user-role.decorator'
import { UserType } from 'src/utils/enums';

@Controller("api/doctors")
export class DoctorsController {
  constructor(
    private readonly doctorsService: DoctorsService,
    private readonly cloudinaryService: CloudinaryService
  ) { }

  // POST : ~/api/doctor/add-doctor (Private - Only Admin)
  @Post("add-doctor")
  @Roles(UserType.ADMIN)
  @UseGuards(AuthRolesGuard)
  @UseInterceptors(FileInterceptor('file'))
  create(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: CreateDoctorDto
  ): Promise<any> {
    return this.doctorsService.addDoctor(body, file);
  }

  // GET /api/doctors/all-doctors (Public)
  @Get('all-doctors')
  async getAllDoctors() {
    return this.doctorsService.getAllDoctors();
  }

}
