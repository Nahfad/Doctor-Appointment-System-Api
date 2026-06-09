import { Patient } from 'src/patient/patient.entity';
import { Users } from 'src/users/users.entity';
import { CURRENT_TIMESTAMP } from 'src/utils/constants';
import { AppointmentStatus } from 'src/utils/enums';
import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn,
} from 'typeorm';

@Entity('appointments')
export class Appointment {
    @PrimaryGeneratedColumn()
    id: number;

    // التاريخ: "2025-06-20"
    @Column({ type: 'date' })
    slotDate: string;

    // الوقت: "10:00"
    @Column({ type: 'varchar', length: 5 })
    slotTime: string;

    // حالة الموعد
    @Column({
        type: 'enum',
        enum: AppointmentStatus,
        default: AppointmentStatus.PENDING,
    })
    status: AppointmentStatus;

    @CreateDateColumn({ type: 'timestamp', default: () => CURRENT_TIMESTAMP })
    createdAt: Date;

    @UpdateDateColumn({ type: 'timestamp', default: () => CURRENT_TIMESTAMP, onUpdate: CURRENT_TIMESTAMP })
    updatedAt: Date;

    // المريض
    @ManyToOne(() => Patient, (patient) => patient.appointments, { onDelete: 'CASCADE' })
    patient: Patient;

    // الدكتور (User بـ role doctor)
    @ManyToOne(() => Users, { onDelete: 'SET NULL', nullable: true, eager: false })
    @JoinColumn({ name: 'doctorId' })
    doctor: Users;

    // الاستقبال أو الادمن اللي عمل الحجز
    @ManyToOne(() => Users, { onDelete: 'SET NULL', nullable: true, eager: false })
    @JoinColumn({ name: 'createdById' })
    createdBy: Users;



}