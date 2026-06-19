import {
    Injectable,
    BadRequestException,
    NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { Attendance } from './attendance.entity';
import { Users } from 'src/users/users.entity';
import { UserType } from 'src/utils/enums';

@Injectable()
export class AttendanceService {
    constructor(
        @InjectRepository(Attendance)
        private readonly attendanceRepository: Repository<Attendance>,
        @InjectRepository(Users)
        private readonly userRepository: Repository<Users>,
    ) { }

    public async checkIn(doctorId: number) {
        const today = this.getTodayDateString();

        const exists = await this.attendanceRepository.findOne({
            where: { doctor: { id: doctorId }, workDate: today },
        });
        if (exists) throw new BadRequestException('Already checked in today');

        const attendance = this.attendanceRepository.create({
            doctor: { id: doctorId },
            workDate: today,
            checkInTime: new Date(),
        });

        return this.attendanceRepository.save(attendance);
    }

    public async checkOut(doctorId: number) {
        const today = this.getTodayDateString();

        const attendance = await this.attendanceRepository.findOne({
            where: { doctor: { id: doctorId }, workDate: today },
        });
        if (!attendance) throw new BadRequestException('No check-in found for today');
        if (attendance.checkOutTime) throw new BadRequestException('Already checked out today');

        attendance.checkOutTime = new Date();
        const hoursWorked = (attendance.checkOutTime.getTime() - attendance.checkInTime.getTime()) / 3600000;
        attendance.hoursWorked = Number(hoursWorked.toFixed(2));

        return this.attendanceRepository.save(attendance);
    }

    public async getDoctorAttendance(
        doctorId: number,
        page: number,
        limit: number,
        startDate?: string,
        endDate?: string,
    ) {
        const doctor = await this.userRepository.findOne({
            where: { id: doctorId, userType: UserType.DOCTOR },
        });
        if (!doctor) throw new NotFoundException('Doctor not found');

        const where: any = { doctor: { id: doctorId } };
        if (startDate && endDate) where.workDate = Between(startDate, endDate);

        const [records, total] = await this.attendanceRepository.findAndCount({
            where,
            order: { workDate: 'DESC' },
            skip: limit * (page - 1),
            take: limit,
        });

        return { total, page, limit, totalPages: Math.ceil(total / limit), records };
    }

    public async getReport(
        startDate?: string,
        endDate?: string,
        doctorId?: number,
        page: number = 1,
        limit: number = 10,
    ) {
        const where: any = {};
        if (startDate && endDate) where.workDate = Between(startDate, endDate);
        if (doctorId) where.doctor = { id: doctorId };

        const [records, total] = await this.attendanceRepository.findAndCount({
            where,
            relations: ['doctor'],
            select: {
                id: true,
                workDate: true,
                checkInTime: true,
                checkOutTime: true,
                hoursWorked: true,
                createdAt: true,
                updatedAt: true,
                doctor: { id: true, name: true, email: true },
            },
            order: { workDate: 'DESC' },
            skip: limit * (page - 1),
            take: limit,
        });

        return { total, page, limit, totalPages: Math.ceil(total / limit), records };
    }

    private getTodayDateString() {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');

        return `${year}-${month}-${day}`;
    }
}
