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

@Injectable()
export class AppointmentService {
  constructor(
    @InjectRepository(Appointment)
    private readonly appointmentRepository: Repository<Appointment>,
    @InjectRepository(Doctor)
    private readonly doctorRepository: Repository<Doctor>,
    private readonly patientService: UsersService

  ) { }

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
