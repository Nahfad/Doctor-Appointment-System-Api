import {
  Injectable, NotFoundException,
  BadRequestException, ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Appointment } from './appointment.entity';
import { Patient } from 'src/patient/patient.entity';
import { Users } from 'src/users/users.entity';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentStatusDto } from './dto/update-appointment-status.dto';
import { RescheduleAppointmentDto } from './dto/reschedule-appointment.dto';
import { AppointmentStatus, UserType } from 'src/utils/enums';
import { JWTPayloadType } from 'src/utils/types';

@Injectable()
export class AppointmentService {
  constructor(
    @InjectRepository(Appointment)
    private readonly appointmentRepo: Repository<Appointment>,
    @InjectRepository(Patient)
    private readonly patientRepo: Repository<Patient>,
    @InjectRepository(Users)
    private readonly userRepo: Repository<Users>,
  ) { }

  // ─────────────────────────────────────────────
  //  Dashboard
  // ─────────────────────────────────────────────

  /**
   * Get dashboard overview stats
   * @returns totals and appointment status breakdown
   */
  public async getStats() {
    const today = new Date().toISOString().split('T')[0];

    const [
      totalPatients, totalAppointments, todayAppointments,
      pendingCount, confirmedCount, cancelledCount, completedCount,
    ] = await Promise.all([
      this.patientRepo.count(),
      this.appointmentRepo.count(),
      this.appointmentRepo.count({ where: { slotDate: today } }),
      this.appointmentRepo.count({ where: { status: AppointmentStatus.PENDING } }),
      this.appointmentRepo.count({ where: { status: AppointmentStatus.CONFIRMED } }),
      this.appointmentRepo.count({ where: { status: AppointmentStatus.CANCELLED } }),
      this.appointmentRepo.count({ where: { status: AppointmentStatus.COMPLETED } }),
    ]);

    return {
      overview: { totalPatients, totalAppointments, todayAppointments },
      appointmentsByStatus: {
        pending: pendingCount, confirmed: confirmedCount,
        cancelled: cancelledCount, completed: completedCount,
      },
    };
  }

  /**
   * Get latest 5 appointments for dashboard
   * @returns last 5 appointments with patient and doctor info
   */
  public async getLatestAppointments() {
    return this.appointmentRepo.find({
      order: { createdAt: 'DESC' },
      take: 5,
      relations: ['patient', 'doctor'],
      select: {
        id: true, slotDate: true, slotTime: true,
        status: true, createdAt: true,
        patient: { id: true, name: true, phone: true },
        doctor: { id: true, name: true },
      },
    });
  }

  // ─────────────────────────────────────────────
  //  CRUD
  // ─────────────────────────────────────────────

  /**
   * Create new appointment (Receptionist & Admin)
   * @param dto appointment data
   * @param payload JWT payload of the user who created the appointment
   */
  public async createAppointment(dto: CreateAppointmentDto, payload: JWTPayloadType) {

    // 1. التاريخ في المستقبل
    if (new Date(`${dto.slotDate}T${dto.slotTime}:00`) <= new Date()) {
      throw new BadRequestException('Appointment date and time must be in the future');
    }

    // 2. المريض موجود
    const patient = await this.patientRepo.findOne({ where: { id: dto.patientId } });
    if (!patient) throw new NotFoundException('Patient not found');

    // 3. الدكتور موجود وعنده role doctor
    const doctor = await this.userRepo.findOne({
      where: { id: dto.doctorId, userType: UserType.DOCTOR },
    });
    if (!doctor) throw new NotFoundException('Doctor not found');

    // 4. منع Double Booking
    const conflict = await this.appointmentRepo.findOne({
      where: [
        { doctor: { id: dto.doctorId }, slotDate: dto.slotDate, slotTime: dto.slotTime, status: AppointmentStatus.PENDING },
        { doctor: { id: dto.doctorId }, slotDate: dto.slotDate, slotTime: dto.slotTime, status: AppointmentStatus.CONFIRMED },
      ],
    });
    if (conflict) {
      throw new BadRequestException(`Slot ${dto.slotTime} on ${dto.slotDate} is already booked`);
    }

    // 5. نفس المريض مش عنده موعد مؤكد أو معلق في نفس التوقيت
    const patientConflict = await this.appointmentRepo.findOne({
      where: [
        { patient: { id: dto.patientId }, slotDate: dto.slotDate, slotTime: dto.slotTime, status: AppointmentStatus.PENDING },
        { patient: { id: dto.patientId }, slotDate: dto.slotDate, slotTime: dto.slotTime, status: AppointmentStatus.CONFIRMED },
      ],
    });
    if (patientConflict) {
      throw new BadRequestException('Patient already has an appointment at this time');
    }

    const createdBy = await this.userRepo.findOne({ where: { id: payload.id } });

    const appointment = this.appointmentRepo.create({
      slotDate: dto.slotDate,
      slotTime: dto.slotTime,
      status: AppointmentStatus.PENDING,
      patient,
      doctor,
      createdBy,
    });

    return this.appointmentRepo.save(appointment);
  }

  /**
   * Get all appointments with filters (Admin & Receptionist)
   * Doctor gets only their own appointments
   */
  public async getAllAppointments(
    payload: JWTPayloadType,
    patientId?: number,
    doctorId?: number,
    status?: AppointmentStatus,
    date?: string,
    page: number = 1,
    limit: number = 10,
  ) {
    const where: any = {};

    // الدكتور يشوف مواعيده بس
    if (payload.userType === UserType.DOCTOR) {
      where.doctor = { id: payload.id };
    } else {
      if (doctorId) where.doctor = { id: doctorId };
    }

    if (patientId) where.patient = { id: patientId };
    if (status) where.status = status;
    if (date) where.slotDate = date;

    const [appointments, total] = await this.appointmentRepo.findAndCount({
      where,
      order: { slotDate: 'ASC', slotTime: 'ASC' },
      relations: ['patient', 'doctor', 'createdBy'],
      skip: limit * (page - 1),
      take: limit,
    });

    return { total, page, limit, totalPages: Math.ceil(total / limit), appointments };
  }

  /**
   * Get single appointment by id
   */
  public async getAppointmentById(id: number) {
    const appointment = await this.appointmentRepo.findOne({
      where: { id },
      relations: ['patient', 'doctor', 'createdBy'],
    });
    if (!appointment) throw new NotFoundException('Appointment not found');
    return appointment;
  }

  /**
   * Update appointment status with role-based transition rules
   * pending   → confirmed : Receptionist | Admin
   * confirmed → completed : Doctor | Receptionist
   * any       → cancelled : All roles
   */
  public async updateStatus(id: number, dto: UpdateAppointmentStatusDto, payload: JWTPayloadType) {
    const appointment = await this.getAppointmentById(id);
    const { status } = dto;

    // المواعيد المكتملة لا تتعدل
    if (appointment.status === AppointmentStatus.COMPLETED) {
      throw new BadRequestException('Completed appointments cannot be modified');
    }

    // قواعد الانتقال
    if (status === AppointmentStatus.CONFIRMED) {
      if (![UserType.ADMIN, UserType.RECEPTIONIST].includes(payload.userType)) {
        throw new ForbiddenException('Only Admin or Receptionist can confirm appointments');
      }
    }

    if (status === AppointmentStatus.COMPLETED) {
      if (![UserType.ADMIN, UserType.DOCTOR, UserType.RECEPTIONIST].includes(payload.userType)) {
        throw new ForbiddenException('Only Doctor or Receptionist can complete appointments');
      }
      if (appointment.status !== AppointmentStatus.CONFIRMED) {
        throw new BadRequestException('Only confirmed appointments can be marked as completed');
      }
    }

    appointment.status = status;
    return this.appointmentRepo.save(appointment);
  }

  /**
   * Reschedule a cancelled appointment → creates new pending appointment
   * (Receptionist & Admin only)
   */
  public async rescheduleAppointment(id: number, dto: RescheduleAppointmentDto, payload: JWTPayloadType) {
    const old = await this.getAppointmentById(id);

    if (old.status !== AppointmentStatus.CANCELLED) {
      throw new BadRequestException('Only cancelled appointments can be rescheduled');
    }

    // التاريخ الجديد في المستقبل
    if (new Date(`${dto.slotDate}T${dto.slotTime}:00`) <= new Date()) {
      throw new BadRequestException('New appointment date and time must be in the future');
    }

    // منع Double Booking في الـ slot الجديد
    const conflict = await this.appointmentRepo.findOne({
      where: [
        { doctor: { id: old.doctor.id }, slotDate: dto.slotDate, slotTime: dto.slotTime, status: AppointmentStatus.PENDING },
        { doctor: { id: old.doctor.id }, slotDate: dto.slotDate, slotTime: dto.slotTime, status: AppointmentStatus.CONFIRMED },
      ],
    });
    if (conflict) {
      throw new BadRequestException(`Slot ${dto.slotTime} on ${dto.slotDate} is already booked`);
    }

    const createdBy = await this.userRepo.findOne({ where: { id: payload.id } });

    const newAppointment = this.appointmentRepo.create({
      patient: old.patient,
      doctor: old.doctor,
      slotDate: dto.slotDate,
      slotTime: dto.slotTime,
      status: AppointmentStatus.PENDING,
      createdBy,
    });

    return this.appointmentRepo.save(newAppointment);
  }

  /**
   * Delete appointment (Admin only)
   */
  public async deleteAppointment(id: number) {
    const appointment = await this.getAppointmentById(id);
    await this.appointmentRepo.remove(appointment);
    return { message: 'Appointment deleted successfully' };
  }
}