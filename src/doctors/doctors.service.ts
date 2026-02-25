import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateDoctorDto } from './dto/create-doctor.dto';
import { Repository } from 'typeorm';
import { Doctor } from './doctors.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class DoctorsService {
  constructor(
    @InjectRepository(Doctor)
    private readonly doctorRepository: Repository<Doctor>,
    private readonly cloudinary: CloudinaryService
  ) { }

  /**
   * Api for adding doctor
   * @param dto the data for the doctor
   * @param file file for the image 
   * @returns the new doctor added
   */
  public async addDoctor(dto: CreateDoctorDto, file: Express.Multer.File) {

    // sure email is exist or not
    const existing = await this.doctorRepository.findOne({
      where: { email: dto.email }
    });
    if (existing) {
      throw new BadRequestException("doctor aleardy exist");
    };

    // upload image in cloadinary
    let imageUrl: string;
    try {
      const uploadResult = await this.cloudinary.uploadFile(file);
      imageUrl = uploadResult.secure_url;
    } catch (error) {
      throw new BadRequestException('faild to upload image' + error.message);
    }

    // hased password
    const hashedPassword = await this.hashPassword(dto.password);

    const newDoctor: any = this.doctorRepository.create({
      ...dto,
      password: hashedPassword,
      imageUrl: imageUrl
    })
    return await this.doctorRepository.save(newDoctor)
  }



  public async getAllDoctors() {
    const doctors = await this.doctorRepository.find({
      select: {
        id: true,
        name: true,
        email: true,
        speciality: true,
        degree: true,
        experience: true,
        about: true,
        available: true,
        fees: true,
        imageUrl: true,
        address: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return { success: true, doctors };
  }

/**
* Hashing Password
* @param password plain text password
* @returns hashing password
*/
  public async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
  }
}
