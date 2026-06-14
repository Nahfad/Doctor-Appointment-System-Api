import {
    Injectable, NotFoundException,
    BadRequestException, ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Visit } from './visit.entity';
import { Prescription } from 'src/visit/prescription/prescription.entity';
import { Patient } from 'src/patient/patient.entity';
import { Appointment } from 'src/appointment/appointment.entity';
import { Users } from 'src/users/users.entity';
import { CreateVisitDto } from './dto/create-visit.dto';
import { UpdateVisitDto } from './dto/update-visit.dto';
import { AppointmentStatus, UserType } from 'src/utils/enums';
import { JWTPayloadType } from 'src/utils/types';

@Injectable()
export class VisitService {
    constructor(
        @InjectRepository(Visit)
        private readonly visitRepo: Repository<Visit>,
        @InjectRepository(Prescription)
        private readonly prescriptionRepo: Repository<Prescription>,
        @InjectRepository(Patient)
        private readonly patientRepo: Repository<Patient>,
        @InjectRepository(Appointment)
        private readonly appointmentRepo: Repository<Appointment>,
        @InjectRepository(Users)
        private readonly userRepo: Repository<Users>,
    ) { }

    /**
     * Create a new visit with prescriptions (Doctor only)
     * بيتحقق إن المريض عنده موعد confirmed أو pending
     * @param dto data for creating visit
     * @param 
     */
    public async createVisit(dto: CreateVisitDto, payload: JWTPayloadType) {
        const patient = await this.patientRepo.findOne({ where: { id: dto.patientId } });
        if (!patient) throw new NotFoundException('Patient not found');

        // التحقق إن المريض عنده موعد مؤكد أو معلق مع الدكتور ده
        const validAppointment = await this.appointmentRepo.findOne({
            where: [
                { patient: { id: dto.patientId }, doctor: { id: payload.id }, status: AppointmentStatus.CONFIRMED },
                { patient: { id: dto.patientId }, doctor: { id: payload.id }, status: AppointmentStatus.PENDING },
            ],
        });
        if (!validAppointment) {
            throw new BadRequestException('Patient must have a confirmed or pending appointment with you');
        }

        // لو بعت appointmentId — التحقق إنه مش ملغي
        let appointment: Appointment | null = null;
        if (dto.appointmentId) {
            appointment = await this.appointmentRepo.findOne({ where: { id: dto.appointmentId } });
            if (!appointment) throw new NotFoundException('Appointment not found');
            if (appointment.status === AppointmentStatus.CANCELLED) {
                throw new BadRequestException('Cannot create visit for a cancelled appointment');
            }
        }

        const doctor = await this.userRepo.findOne({ where: { id: payload.id } });

        const visit = this.visitRepo.create({
            complaint: dto.complaint,
            diagnosis: dto.diagnosis,
            treatment: dto.treatment,
            notes: dto.notes,
            visitDate: dto.visitDate ?? new Date().toISOString().split('T')[0],
            patient,
            doctor,
            appointment,
        });

        await this.visitRepo.save(visit);

        // حفظ الـ prescriptions
        const prescriptions = dto.prescriptions.map(p =>
            this.prescriptionRepo.create({ ...p, visit }),
        );
        await this.prescriptionRepo.save(prescriptions);

        return this.visitRepo.findOne({
            where: { id: visit.id },
            relations: ['patient', 'doctor', 'prescriptions'],
        });
    }

    /**
     * Get all visits with filters
     * Admin/Receptionist: كل الزيارات
     * Doctor: زياراته بس
     */
    public async getAllVisits(
        payload: JWTPayloadType,
        patientId?: number,
        doctorId?: number,
        page: number = 1,
        limit: number = 10,
    ) {
        const where: any = {};

        if (payload.userType === UserType.DOCTOR) {
            where.doctor = { id: payload.id };
        } else {
            if (doctorId) where.doctor = { id: doctorId };
        }

        if (patientId) where.patient = { id: patientId };

        const [visits, total] = await this.visitRepo.findAndCount({
            where,
            order: { visitDate: 'DESC' },
            relations: ['patient', 'doctor', 'prescriptions'],
            skip: limit * (page - 1),
            take: limit,
        });

        return { total, page, limit, totalPages: Math.ceil(total / limit), visits };
    }

    /**
     * Get single visit by id
     */
    public async getVisitById(id: number) {
        const visit = await this.visitRepo.findOne({
            where: { id },
            relations: ['patient', 'doctor', 'prescriptions', 'appointment'],
        });
        if (!visit) throw new NotFoundException('Visit not found');
        return visit;
    }

    /**
     * Update visit (Doctor — own visits only, within 24 hours)
     */
    public async updateVisit(id: number, dto: UpdateVisitDto, payload: JWTPayloadType) {
        const visit = await this.visitRepo.findOne({
            where: { id },
            relations: ['doctor', 'prescriptions'],
        });
        if (!visit) throw new NotFoundException('Visit not found');

        // الدكتور يعدل زياراته بس
        if (visit.doctor.id !== payload.id) {
            throw new ForbiddenException('You can only edit your own visits');
        }

        // خلال 24 ساعة بس
        const hoursDiff = (Date.now() - visit.createdAt.getTime()) / (1000 * 60 * 60);
        if (hoursDiff > 24) {
            throw new BadRequestException('Visits can only be edited within 24 hours of creation');
        }

        Object.assign(visit, {
            complaint: dto.complaint ?? visit.complaint,
            diagnosis: dto.diagnosis ?? visit.diagnosis,
            treatment: dto.treatment ?? visit.treatment,
            notes: dto.notes ?? visit.notes,
            visitDate: dto.visitDate ?? visit.visitDate,
        });

        await this.visitRepo.save(visit);

        // تحديث الـ prescriptions لو بعتهم
        if (dto.prescriptions) {
            await this.prescriptionRepo.delete({ visit: { id } });
            const updated = dto.prescriptions.map(p =>
                this.prescriptionRepo.create({ ...p, visit }),
            );
            await this.prescriptionRepo.save(updated);
        }

        return this.visitRepo.findOne({
            where: { id },
            relations: ['patient', 'doctor', 'prescriptions'],
        });
    }

    /**
     * Delete visit (Admin only) — cascade deletes prescriptions
     */
    public async deleteVisit(id: number) {
        const result = await this.visitRepo.delete(id);
        if (result.affected === 0) throw new NotFoundException('Visit not found');
        return { message: 'Visit deleted successfully' };
    }
}