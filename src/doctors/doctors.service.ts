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
    // upload image in cloadinary
    let imageUrl: string;
    try {
      const uploadResult = await this.cloudinary.uploadFile(file);
      imageUrl = uploadResult.secure_url;
    } catch (error) {
      throw new BadRequestException('faild to upload image');
    }

    const newDoctor = this.doctorRepository.create({
      ...dto,
      imageUrl: imageUrl
    })
    await this.doctorRepository.save(newDoctor)
    return { message: "Doctor added successfuly", newDoctor }
  }


  /**
   * Get all doctors from the database
   * @returns collection of doctors
   */
  public async getAllDoctors() {
    const doctors = await this.doctorRepository.find();
    return { success: true, doctors };
  }


  /**
 * Get all doctors from the database
 * @returns collection of doctors
 */
  public async getDoctor(id: number) {
    const doctor = await this.doctorRepository.findOne({ where: { id } });
    if (!doctor) throw new NotFoundException("Doctor not found");
    return { success: true, doctor };
  }


  /**
  * Hashing Password
  * @param password plain text password
  * @returns hashing password
  */
  public async hashPassword(password: string) {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
  }
}
