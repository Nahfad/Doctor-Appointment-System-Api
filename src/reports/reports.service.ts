import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Patient } from 'src/patient/patient.entity';
import { Appointment } from 'src/appointment/appointment.entity';
import { Visit } from 'src/visit/visit.entity';
import { Users } from 'src/users/users.entity';
import { ReportFilterDto } from './dto/report-filter.dto';
import { AppointmentStatus, Gender, UserType } from 'src/utils/enums';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Patient)
    private readonly patientRepo: Repository<Patient>,
    @InjectRepository(Appointment)
    private readonly appointmentRepo: Repository<Appointment>,
    @InjectRepository(Visit)
    private readonly visitRepo: Repository<Visit>,
    @InjectRepository(Users)
    private readonly userRepo: Repository<Users>,
  ) { }

  // ─────────────────────────────────────────────
  //  1. Patients Report
  // ─────────────────────────────────────────────

  /**
   * Patients Report
   * إجمالي المرضى، تسجيلات جديدة، توزيع الجنس والعمر
   */
  public async getPatientsReport(filter: ReportFilterDto) {
    const { startDate, endDate } = filter;

    const totalPatients = await this.patientRepo.count();

    // التسجيلات الجديدة في الفترة المحددة
    const qb = this.patientRepo.createQueryBuilder('p');
    if (startDate) qb.andWhere('p.createdAt >= :startDate', { startDate });
    if (endDate) qb.andWhere('p.createdAt <= :endDate', { endDate });
    const newRegistrations = await qb.getCount();

    // توزيع الجنس
    const genderBreakdown = await this.patientRepo
      .createQueryBuilder('p')
      .select('p.gender', 'gender')
      .addSelect('COUNT(p.id)', 'count')
      .groupBy('p.gender')
      .getRawMany();

    // توزيع الأعمار في فئات
    const ageGroups = await this.patientRepo
      .createQueryBuilder('p')
      .select(`
        CASE
          WHEN p.age < 18 THEN '0-17'
          WHEN p.age BETWEEN 18 AND 35 THEN '18-35'
          WHEN p.age BETWEEN 36 AND 50 THEN '36-50'
          WHEN p.age BETWEEN 51 AND 65 THEN '51-65'
          ELSE '65+'
        END`, 'ageGroup')
      .addSelect('COUNT(p.id)', 'count')
      .groupBy('"ageGroup"')
      .getRawMany();

    return {
      totalPatients,
      newRegistrations,
      genderBreakdown,
      ageDistribution: ageGroups,
      filter: { startDate, endDate },
    };
  }

  // ─────────────────────────────────────────────
  //  2. Appointments Report
  // ─────────────────────────────────────────────

  /**
   * Appointments Report
   * إجمالي المواعيد بالحالة، لكل دكتور، معدل الإلغاء، ساعات الذروة
   */
  public async getAppointmentsReport(filter: ReportFilterDto) {
    const { startDate, endDate, doctorId } = filter;

    const baseQb = () => {
      const qb = this.appointmentRepo.createQueryBuilder('a');
      if (startDate) qb.andWhere('a.slotDate >= :startDate', { startDate });
      if (endDate) qb.andWhere('a.slotDate <= :endDate', { endDate });
      if (doctorId) qb.andWhere('a.doctorId = :doctorId', { doctorId });
      return qb;
    };

    const totalAppointments = await baseQb().getCount();

    // المواعيد حسب الحالة
    const byStatus = await baseQb()
      .select('a.status', 'status')
      .addSelect('COUNT(a.id)', 'count')
      .groupBy('a.status')
      .getRawMany();

    // المواعيد لكل دكتور
    const byDoctor = await baseQb()
      .leftJoin('a.doctor', 'doctor')
      .select('doctor.id', 'doctorId')
      .addSelect('doctor.name', 'doctorName')
      .addSelect('COUNT(a.id)', 'totalAppointments')
      .groupBy('doctor.id')
      .addGroupBy('doctor.name')
      .orderBy('COUNT(a.id)', 'DESC')
      .getRawMany();

    // معدل الإلغاء
    const cancelledCount = await baseQb()
      .andWhere('a.status = :status', { status: AppointmentStatus.CANCELLED })
      .getCount();
    const cancellationRate = totalAppointments > 0
      ? +((cancelledCount / totalAppointments) * 100).toFixed(2)
      : 0;

    // ساعات الذروة — أكثر الأوقات حجزاً
    const peakHours = await baseQb()
      .select('a.slotTime', 'slotTime')
      .addSelect('COUNT(a.id)', 'count')
      .groupBy('a.slotTime')
      .orderBy('COUNT(a.id)', 'DESC')
      .limit(5)
      .getRawMany();

    return {
      totalAppointments,
      byStatus,
      byDoctor,
      cancellationRate,
      peakHours,
      filter: { startDate, endDate, doctorId },
    };
  }

  // ─────────────────────────────────────────────
  //  3. Doctors Report
  // ─────────────────────────────────────────────

  /**
   * Doctors Report
   * زيارات لكل دكتور، مواعيد تمت معالجتها، عدد المرضى لكل دكتور
   */
  public async getDoctorsReport(filter: ReportFilterDto) {
    const { startDate, endDate } = filter;

    // كل الأطباء
    const doctors = await this.userRepo.find({
      where: { userType: UserType.DOCTOR },
      select: ['id', 'name', 'speciality'],
    });

    const report = await Promise.all(
      doctors.map(async (doctor) => {
        // عدد الزيارات
        const visitsQb = this.visitRepo.createQueryBuilder('v')
          .where('v.doctorId = :doctorId', { doctorId: doctor.id });
        if (startDate) visitsQb.andWhere('v.visitDate >= :startDate', { startDate });
        if (endDate) visitsQb.andWhere('v.visitDate <= :endDate', { endDate });
        const totalVisits = await visitsQb.getCount();

        // المواعيد المكتملة
        const appointmentsQb = this.appointmentRepo.createQueryBuilder('a')
          .where('a.doctorId = :doctorId', { doctorId: doctor.id });
        if (startDate) appointmentsQb.andWhere('a.slotDate >= :startDate', { startDate });
        if (endDate) appointmentsQb.andWhere('a.slotDate <= :endDate', { endDate });
        const totalAppointments = await appointmentsQb.getCount();

        const completedAppointments = await appointmentsQb
          .andWhere('a.status = :status', { status: AppointmentStatus.COMPLETED })
          .getCount();

        // عدد المرضى المختلفين
        const distinctPatients = await this.appointmentRepo
          .createQueryBuilder('a')
          .select('COUNT(DISTINCT a.patientId)', 'count')
          .where('a.doctorId = :doctorId', { doctorId: doctor.id })
          .getRawOne();

        return {
          doctorId: doctor.id,
          doctorName: doctor.name,
          speciality: doctor.speciality,
          totalVisits,
          totalAppointments,
          completedAppointments,
          uniquePatients: +distinctPatients.count,
        };
      }),
    );

    return { doctors: report, filter: { startDate, endDate } };
  }

  // ─────────────────────────────────────────────
  //  4. Visits Report
  // ─────────────────────────────────────────────

  /**
   * Visits Report
   * إجمالي الزيارات لكل فترة، أكثر التشخيصات شيوعاً، اتجاهات الزيارات
   */
  public async getVisitsReport(filter: ReportFilterDto) {
    const { startDate, endDate, patientId } = filter;

    const baseQb = () => {
      const qb = this.visitRepo.createQueryBuilder('v');
      if (startDate) qb.andWhere('v.visitDate >= :startDate', { startDate });
      if (endDate) qb.andWhere('v.visitDate <= :endDate', { endDate });
      if (patientId) qb.andWhere('v.patientId = :patientId', { patientId });
      return qb;
    };

    const totalVisits = await baseQb().getCount();

    // أكثر التشخيصات شيوعاً
    const commonDiagnoses = await baseQb()
      .select('v.diagnosis', 'diagnosis')
      .addSelect('COUNT(v.id)', 'count')
      .groupBy('v.diagnosis')
      .orderBy('COUNT(v.id)', 'DESC')
      .limit(10)
      .getRawMany();

    // اتجاهات الزيارات — عدد الزيارات لكل يوم
    const visitTrends = await baseQb()
      .select('v.visitDate', 'date')
      .addSelect('COUNT(v.id)', 'count')
      .groupBy('v.visitDate')
      .orderBy('v.visitDate', 'ASC')
      .getRawMany();

    return {
      totalVisits,
      commonDiagnoses,
      visitTrends,
      filter: { startDate, endDate, patientId },
    };
  }
}