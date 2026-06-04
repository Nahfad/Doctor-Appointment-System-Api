import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateDoctorDto } from './dto/create-doctor.dto';
import { Repository } from 'typeorm';
import { Doctor } from './doctors.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import * as bcrypt from 'bcrypt';
import { DoctorSpeciality } from 'src/utils/enums';
import { UpdateDoctorDto } from './dto/update-doctor.dto';


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
    * @param page current page number
    * @param limit number of items per page
    * @returns collection of doctors
    */
  public async getAllDoctors(
    page: number = 1,
    limit: number = 10,
  ) {

    const skip = (page - 1) * limit;

    const [doctors, total] =
      await this.doctorRepository.findAndCount({
        skip,
        take: limit,
      });

    return {
      success: true,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      doctors,
    };
  }


  /**
  * Get all available specialities
  * @returns list of specialities as key-value
  */
  public getSpecialities() {
    return {
      total: Object.keys(DoctorSpeciality).length,
      specialities: Object.entries(DoctorSpeciality).map(([key, value]) => ({
        key,
        label: value,
      })),
    };
  }


  /**
  * Get doctors filtered by speciality with pagination
  * @param speciality the speciality to filter by
  * @param pageNumber current page
  * @param limit items per page
  * @returns doctors matching the speciality
  */
  public async getDoctorsBySpeciality(
    speciality: DoctorSpeciality,
    pageNumber: number,
    limit: number,
  ) {
    const [doctors, total] = await this.doctorRepository.findAndCount({
      where: { speciality },
      order: { experienceYears: 'DESC' },
      skip: limit * (pageNumber - 1),
      take: limit,
    });

    if (!total) throw new NotFoundException(`No doctors found for speciality: ${speciality}`);

    return {
      total,
      page: pageNumber,
      limit,
      totalPages: Math.ceil(total / limit),
      speciality,
      doctors,
    };
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
 * Update doctor data
 * @param id doctor id
 * @param dto updated data
 * @param file optional new image
 * @returns updated doctor
 */
  public async updateDoctor(id: number, dto: UpdateDoctorDto, file?: Express.Multer.File) {
    const doctor = await this.doctorRepository.findOne({ where: { id } });
    if (!doctor) throw new NotFoundException('Doctor not found');

    if (file) {
      try {
        const uploadResult = await this.cloudinary.uploadFile(file);
        doctor.imageUrl = uploadResult.secure_url;
      } catch {
        throw new BadRequestException('Failed to upload image');
      }
    }

    Object.assign(doctor, dto);
    await this.doctorRepository.save(doctor);
    return { message: 'Doctor updated successfully', doctor };
  }

  /**
   * Delete doctor by id
   * @param id doctor id
   * @returns success message
   */
  public async deleteDoctor(id: number) {
    const doctor = await this.doctorRepository.findOne({ where: { id } });
    if (!doctor) throw new NotFoundException('Doctor not found');

    await this.doctorRepository.remove(doctor);
    return { message: 'Doctor deleted successfully' };
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
