import { Doctor } from 'src/doctors/doctors.entity';
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
} from 'typeorm';

@Entity('appointments')
export class Appointment {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'text', nullable: true })
    reason: string;

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

    @ManyToOne(() => Users, (user) => user.appointments, { onDelete: 'CASCADE' })
    user: Users;

    @ManyToOne(() => Doctor, (doctor) => doctor.appointments, { onDelete: 'CASCADE' })
    doctor: Doctor;
}