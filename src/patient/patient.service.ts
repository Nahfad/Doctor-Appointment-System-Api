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

const ALLOWED_SORT = ['name', 'age', 'createdAt'];

@Injectable()
export class PatientService {
    constructor(
        @InjectRepository(Patient)
        private readonly patientRepository: Repository<Patient>,
    ) { }

    /**
     * Register a new patient (Admin & Receptionist)
     * @param dto data for user
     * @return data for user save in db
     */
    public async createPatient(dto: CreatePatientDto) {
        const exists = await this.patientRepository.findOne({ where: { phone: dto.phone } });
        if (exists) throw new BadRequestException('Phone number already registered');

        const patient = this.patientRepository.create(dto);
        return this.patientRepository.save(patient);
    }

    /**
     * Get all patients with search, filter, sort & pagination
     * 
     */
    public async getAllPatients(
        search?: string,
        gender?: Gender,
        sortBy: string = 'createdAt',
        order: 'ASC' | 'DESC' = 'DESC',
        page: number = 1,
        limit: number = 10,
    ) {
        // Whitelist للـ sortBy
        const sort = ALLOWED_SORT.includes(sortBy) ? sortBy : 'createdAt';
        const where = search
            ? [
                { name: ILike(`%${search}%`), ...(gender && { gender }) },
                { phone: ILike(`%${search}%`), ...(gender && { gender }) },
            ]
            : gender ? [{ gender }] : {};
        const [patients, total] = await this.patientRepository.findAndCount({
            where,
            order: { [sort]: order },
            skip: limit * (page - 1),
            take: limit,
        });
        return { total, page, limit, totalPages: Math.ceil(total / limit), patients };
    }

    /**
     * Get patient profile by id
     * @Param Id for Patient
     * @return patient i need
     */
    public async getPatientById(id: number) {
        const patient = await this.patientRepository.findOne({
            where: { id },
            relations: ['appointments', 'appointments.doctor'],
        });
        if (!patient) throw new NotFoundException('Patient not found');
        return patient;
    }

    /**
     * Update patient data (Admin & Receptionist)
     * @param id for the patient 
     * @param data the data i need to change
     * @returns the new data saved in db
     */
    public async updatePatient(id: number, dto: UpdatePatientDto) {
        const patient = await this.patientRepository.findOne({ where: { id } });
        if (!patient) throw new NotFoundException('Patient not found');

        if (dto.phone && dto.phone !== patient.phone) {
            const exists = await this.patientRepository.findOne({ where: { phone: dto.phone } });
            if (exists) throw new BadRequestException('Phone number already used by another patient');
        }

        Object.assign(patient, dto);
        return this.patientRepository.save(patient);
    }

    /**
     * Soft delete patient (Admin only)
     * @param id for the patient
     * @returns msg for successs
     */
    public async deletePatient(id: number) {
        const result = await this.patientRepository.softDelete(id);
        if (result.affected === 0) throw new NotFoundException('Patient not found');
        return { message: 'Patient archived successfully' };
    }
}