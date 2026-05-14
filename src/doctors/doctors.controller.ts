import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UploadedFile, UseGuards, ParseIntPipe } from '@nestjs/common';
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

  // GET /api/doctors   (Public)
  @Get()
  async getAllDoctors() {
    return this.doctorsService.getAllDoctors();
  }

  // GET /api/doctors/:id (Public)
  @Get(':id')
  async getDoctor(@Param('id', ParseIntPipe) id: number) {
    return this.doctorsService.getDoctor(id);
  }


}
