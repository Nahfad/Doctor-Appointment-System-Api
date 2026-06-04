import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Appointment } from './appointment.entity';
import { Doctor } from '../doctors/doctors.entity';
import { Users } from '../users/users.entity';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UsersService } from 'src/users/users.service';
import { AppointmentStatus, UserType } from 'src/utils/enums';
import { JWTPayloadType } from 'src/utils/types';

@Injectable()
export class AppointmentService {
  constructor(
    @InjectRepository(Appointment)
    private readonly appointmentRepository: Repository<Appointment>,
    @InjectRepository(Doctor)
    private readonly doctorRepository: Repository<Doctor>,
    @InjectRepository(Users)
    private readonly userRepository: Repository<Users>,
    private readonly usersService: UsersService,
  ) { }


  /**
   * Api for adding Appointment
   * @param dto the data for the Appointment
   * @returns the new Appointment 
   */
  public async createAppointment(dto: CreateAppointmentDto, userId: number) {

    // 1. التحقق من أن التاريخ في المستقبل
    const appointmentDateTime = new Date(`${dto.slotDate}T${dto.slotTime}:00`);
    if (appointmentDateTime <= new Date()) {
      throw new BadRequestException('Appointment date and time must be in the future');
    }

    // 2. جلب الدكتور
    const doctor = await this.doctorRepository.findOne({
      where: { id: dto.doctorId },
    });
    if (!doctor) throw new NotFoundException('Doctor not found');

    // 3. منع الـ Double Booking — بس على المواعيد الفعّالة (مش الملغية)
    const conflict = await this.appointmentRepository.findOne({
      where: [
        { doctor: { id: dto.doctorId }, slotDate: dto.slotDate, slotTime: dto.slotTime, status: AppointmentStatus.PENDING },
        { doctor: { id: dto.doctorId }, slotDate: dto.slotDate, slotTime: dto.slotTime, status: AppointmentStatus.CONFIRMED },
      ],
    });
    if (conflict) {
      throw new BadRequestException(
        `The slot ${dto.slotTime} on ${dto.slotDate} is already booked. Please choose another time.`,
      );
    }

    // 4. تحديث slots_booked في الدكتور
    if (!doctor.slots_booked) doctor.slots_booked = {};
    if (!doctor.slots_booked[dto.slotDate]) doctor.slots_booked[dto.slotDate] = [];

    doctor.slots_booked[dto.slotDate].push(dto.slotTime);
    await this.doctorRepository.save(doctor);

    // 5. إنشاء الموعد
    const user = await this.usersService.getCurrentUser(userId);

    const appointment = this.appointmentRepository.create({
      reason: dto.reason,
      slotDate: dto.slotDate,
      slotTime: dto.slotTime,
      status: AppointmentStatus.PENDING,
      user,
      doctor,
    });

    return this.appointmentRepository.save(appointment);
  }

  /**
   * Get All Appointments
   * @param pageNumber number of the current page
   * @param appointmentsPerPage data per page
   * @returns collection of appointments
   */
  public async getAllAppointments(pageNumber: number, appointmentPerPage: number) {
    return this.appointmentRepository.find({
      skip: appointmentPerPage * (pageNumber - 1),
      take: appointmentPerPage,
      order: { createdAt: 'DESC' },
      relations: ['user', 'doctor'],
    });
  }

  /**
   * Api for getting all appointments for the current patient
   * @param userId the current authenticated user id
   * @returns list of patient appointments or empty array
   */
  public async getMyAppointment(id: number) {
    return this.appointmentRepository.find({
      where: { user: { id } },
      relations: ['doctor'],
      order: { slotDate: 'ASC', slotTime: 'ASC' },
    });
  }

  /**
 * Get appointments statistics grouped by status
 * @returns appointments count by status
 */
  public async getStats() {
    const today = new Date().toISOString().split('T')[0];

    const [
      totalDoctors,
      totalPatients,
      totalAppointments,
      todayAppointments,
      pendingCount,
      confirmedCount,
      cancelledCount,
      completedCount,
    ] = await Promise.all([
      this.doctorRepository.count(),
      this.userRepository.count(),
      this.appointmentRepository.count(),
      this.appointmentRepository.count({ where: { slotDate: today } }),
      this.appointmentRepository.count({ where: { status: AppointmentStatus.PENDING } }),
      this.appointmentRepository.count({ where: { status: AppointmentStatus.CONFIRMED } }),
      this.appointmentRepository.count({ where: { status: AppointmentStatus.CANCELLED } }),
      this.appointmentRepository.count({ where: { status: AppointmentStatus.COMPLETED } }),
    ]);

    return {
      overview: { totalDoctors, totalPatients, totalAppointments, todayAppointments },
      appointmentsByStatus: {
        pending: pendingCount,
        confirmed: confirmedCount,
        cancelled: cancelledCount,
        completed: completedCount,
      },
    };
  }

  /**
   * Get latest appointments from the database
   * @returns collection of latest appointments
   */
  public async getLatestAppointments() {
    return this.appointmentRepository.find({
      order: { createdAt: 'DESC' },
      take: 5,
      relations: ['user', 'doctor'],
      select: {
        id: true, slotDate: true, slotTime: true,
        status: true, reason: true, createdAt: true,
        user: { id: true, name: true },
        doctor: { id: true, name: true, speciality: true },
      },
    });
  }

  /**
   * Update appointment status (Admin only)
   * @param id appointment id
   * @param status the new status
   * @returns updated appointment
   */
  public async updateStatus(id: number, status: AppointmentStatus) {
    const appointment = await this.getAppointmentBy(id);
    // لو الادمن بيلغي الموعد، حرّر الـ slot عشان حد تاني يقدر يحجزه
    if (status === AppointmentStatus.CANCELLED) {
      const doctor = appointment.doctor;
      if (doctor.slots_booked?.[appointment.slotDate]) {
        doctor.slots_booked[appointment.slotDate] = doctor.slots_booked[appointment.slotDate]
          .filter((t) => t !== appointment.slotTime);

        if (doctor.slots_booked[appointment.slotDate].length === 0) {
          delete doctor.slots_booked[appointment.slotDate];
        }
        await this.doctorRepository.save(doctor);
      }
    }

    appointment.status = status;
    return this.appointmentRepository.save(appointment);
  }

  /**
   * Delete appointment by id
   * @param id id for the Appointment
   * @param payload JWTPayload
   * @returns success message
   */
  public async deleteAppointment(id: number, payload: JWTPayloadType) {
    const appointment = await this.getAppointmentBy(id);

    if (appointment.user.id !== payload.id && payload.userType !== UserType.ADMIN) {
      throw new ForbiddenException('Access denied, you are not allowed');
    }

    // تنظيف slots_booked من الدكتور عند الحذف
    const doctor = appointment.doctor;
    if (doctor.slots_booked?.[appointment.slotDate]) {
      doctor.slots_booked[appointment.slotDate] = doctor.slots_booked[appointment.slotDate]
        .filter((t) => t !== appointment.slotTime);

      if (doctor.slots_booked[appointment.slotDate].length === 0) {
        delete doctor.slots_booked[appointment.slotDate];
      }
      await this.doctorRepository.save(doctor);
    }

    await this.appointmentRepository.remove(appointment);
    return { message: 'Appointment has been deleted successfully' };
  }

  /**
   * Get single Appointment by id
   * @param id id for the Appointment
   * @returns Appointment from the database
   */
  public async getAppointmentBy(id: number) {
    const appointment = await this.appointmentRepository.findOne({
      where: { id },
      relations: {
        user: true,
        doctor: true,
      },
    });

    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    return appointment;
  }
}