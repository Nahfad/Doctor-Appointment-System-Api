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
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UsersService } from 'src/users/users.service';
import { UserType } from 'src/utils/enums';
import { JWTPayloadType } from 'src/utils/types';

@Injectable()
export class AppointmentService {
  constructor(
    @InjectRepository(Appointment)
    private readonly appointmentRepository: Repository<Appointment>,
    @InjectRepository(Doctor)
    private readonly doctorRepository: Repository<Doctor>,
    private readonly usersService: UsersService,
  ) { }

  /**
   * Api for adding Appointment
   * @param dto the data for the Appointment
   * @returns the new Appointment 
   */
  public async createAppointment(
    dto: CreateAppointmentDto,
    userId: number,
  ) {

    const user = await this.usersService.getCurrentUser(userId);

    const doctor = await this.doctorRepository.findOne({
      where: { id: dto.doctorId },
    });

    if (!doctor) {
      throw new NotFoundException('Doctor not found');
    }

    const appointment = this.appointmentRepository.create({
      reason: dto.reason,
      date: dto.date,
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
      order: { createdAt: 'DESC' }
    });
  }

  /**
   * Api for getting all appointments for the current patient
   * @param userId the current authenticated user id
   * @returns list of patient appointments
   */
  public async getMyAppointment(id: number) {
    const appointments = await this.appointmentRepository.find({
      where: {
        user: {
          id,
        },
      },
      relations: ['doctor'],
    });

    if (!appointments.length) {
      throw new NotFoundException('No appointments found');
    }

    return appointments;
  }

  /**
   * @param AppointmentId id for the Appointment
   * @param payload JWTPayload
   * @returns message to sucess deleted
  */
  public async deleteAppointment(id: number, payload: JWTPayloadType) {
    const appointment = await this.getAppointmentBy(id);
    if (appointment.user.id === payload.id || payload.userType === UserType.ADMIN) {
      await this.appointmentRepository.remove(appointment);
      return {
        message: 'Appointment has been deleted',
      };
    }
    throw new ForbiddenException(
      'access denied , you are not allowed',
    );
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
      throw new NotFoundException(
        'Appointment not found',
      );
    }

    return appointment;
  }



  // Book a new appointment with slot availability check


  // async bookAppointment(
  //   createAppointmentDto: CreateAppointmentDto) {
  //   const { docId, slotDate, slotTime } = createAppointmentDto;

  //   // 1. Get doctor data
  //   const doctor = await this.doctorRepository.findOne({
  //     where: { id: docId },
  //   });

  //   if (!doctor) {
  //     throw new NotFoundException('Doctor not found');
  //   }

  //   // 2. Initialize slots_booked if not exists
  //   if (!doctor.slots_booked) {
  //     doctor.slots_booked = {};
  //   }

  //   const slots_booked = doctor.slots_booked;

  //   // 3. Check slot availability
  //   if (slots_booked[slotDate]) {
  //     // Date exists, check if time is already booked
  //     if (slots_booked[slotDate].includes(slotTime)) {
  //       throw new BadRequestException('Slot not available');
  //     } else {
  //       // Time available, add it
  //       slots_booked[slotDate].push(slotTime);
  //     }
  //   } else {
  //     // Date doesn't exist, create new array with this time
  //     slots_booked[slotDate] = [slotTime];
  //   }

  //   // 4. Update doctor's slots_booked
  //   await this.doctorRepository.update(docId, { slots_booked });

  //   // 5. Create appointment
  //   try {
  //     const appointment = this.appointmentRepository.create({
  //       ...createAppointmentDto,
  //       cancelled: false,
  //       payment: false,
  //       isCompleted: false,
  //     });

  //     const savedAppointment = await this.appointmentRepository.save(appointment);

  //     return {
  //       success: true,
  //       message: 'Appointment booked successfully',
  //       appointment: savedAppointment,
  //     };
  //   } catch (error) {
  //     throw new BadRequestException('Failed to book appointment');
  //   }
  // }

  // Get appointments by patient ID
  // async getPatientAppointments(id: number) {

  //   const patient = await this.patientService.getCurrentUser(id)
  //   const appointments = await this.appointmentRepository.find({ where: { id: patient.id } })


  //   return {
  //     success: true,
  //     appointments,
  //   };
  // }

  // async cancelAppointment(id: number, userId?: string) {
  //   const apt = await this.appointmentRepository.findOne({ where: { id } });

  //   if (userId && apt.userId !== userId) {
  //     throw new ForbiddenException('Access denied');
  //   }

  //   const doctor = await this.doctorRepository.findOne({ where: { id: apt.docId } });

  //   if (doctor?.slots_booked?.[apt.slotDate]) {
  //     doctor.slots_booked[apt.slotDate] =
  //       doctor.slots_booked[apt.slotDate].filter(time => time !== apt.slotTime);

  //     if (doctor.slots_booked[apt.slotDate].length === 0) {
  //       delete doctor.slots_booked[apt.slotDate];
  //     }

  //     await this.doctorRepository.save(doctor);
  //   }

  //   apt.cancelled = true;
  //   await this.appointmentRepository.save(apt);

  //   return {
  //     success: true,
  //     message: 'Appointment cancelled successfully',
  //   };
  // }

}
