import {
    Injectable,
    NotFoundException,
    BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { Patient } from './patient.entity';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';
import { Gender } from 'src/utils/enums';

@Injectable()
export class PatientService {
    constructor(
        @InjectRepository(Patient)
        private readonly patientRepository: Repository<Patient>,
    ) { }

    /**
     * Register a new patient (Admin & Receptionist only)
     * @param dto patient data
     * @returns created patient
     */
    public async createPatient(dto: CreatePatientDto) {
        // التحقق من أن رقم الهاتف غير مكرر
        const exists = await this.patientRepository.findOne({
            where: { phone: dto.phone },
        });
        if (exists) {
            throw new BadRequestException('A patient with this phone number already exists');
        }

        const patient = this.patientRepository.create(dto);
        return this.patientRepository.save(patient);
    }

    /**
     * Get all patients with search, filter, sort & pagination
     * @param search search by name or phone
     * @param gender filter by gender
     * @param sortBy sort field
     * @param order sort direction
     * @param page current page
     * @param limit items per page
     */
    public async getAllPatients(
        search?: string,
        gender?: Gender,
        sortBy: 'name' | 'age' | 'createdAt' = 'createdAt',
        order: 'ASC' | 'DESC' = 'DESC',
        page: number = 1,
        limit: number = 10,
    ) {
        const where: any[] = [];

        // البحث بالاسم أو الهاتف
        if (search) {
            const conditions: any = { name: ILike(`%${search}%`) };
            const phoneCondition: any = { phone: ILike(`%${search}%`) };
            if (gender) {
                conditions.gender = gender;
                phoneCondition.gender = gender;
            }
            where.push(conditions, phoneCondition);
        } else if (gender) {
            where.push({ gender });
        }

        const [patients, total] = await this.patientRepository.findAndCount({
            where: where.length > 0 ? where : undefined,
            order: { [sortBy]: order },
            skip: limit * (page - 1),
            take: limit,
        });

        return {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
            patients,
        };
    }

    /**
     * Get single patient by id with appointments and visits
     * @param id patient id
     * @returns patient profile with full history
     */
    public async getPatientById(id: number) {
        const patient = await this.patientRepository.findOne({
            where: { id },
            relations: ['appointments', 'appointments.doctor', 'visits', 'visits.prescriptions'],
        });

        if (!patient) throw new NotFoundException('Patient not found');
        return patient;
    }

    /**
     * Update patient data (Admin & Receptionist only)
     * @param id patient id
     * @param dto updated data
     * @returns updated patient
     */
    public async updatePatient(id: number, dto: UpdatePatientDto) {
        const patient = await this.patientRepository.findOne({ where: { id } });
        if (!patient) throw new NotFoundException('Patient not found');

        // التحقق من أن الهاتف الجديد مش مكرر عند شخص تاني
        if (dto.phone && dto.phone !== patient.phone) {
            const exists = await this.patientRepository.findOne({
                where: { phone: dto.phone },
            });
            if (exists) throw new BadRequestException('Phone number already used by another patient');
        }

        Object.assign(patient, dto);
        return this.patientRepository.save(patient);
    }

    /**
     * Soft delete patient (Admin only)
     * بيعمل archive للمريض ومش بيحذفه نهائياً
     * @param id patient id
     * @returns success message
     */
    public async deletePatient(id: number) {
        const patient = await this.patientRepository.findOne({ where: { id } });
        if (!patient) throw new NotFoundException('Patient not found');

        await this.patientRepository.softDelete(id);
        return { message: 'Patient archived successfully' };
    }
}