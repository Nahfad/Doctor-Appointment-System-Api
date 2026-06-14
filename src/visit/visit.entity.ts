import {
    Entity, PrimaryGeneratedColumn, Column,
    CreateDateColumn, UpdateDateColumn,
    ManyToOne, OneToMany, JoinColumn,
} from 'typeorm';
import { Patient } from 'src/patient/patient.entity';
import { Users } from 'src/users/users.entity';
import { Appointment } from 'src/appointment/appointment.entity';
import { CURRENT_TIMESTAMP } from 'src/utils/constants';
import { Prescription } from 'src/visit/prescription/prescription.entity';

@Entity('visits')
export class Visit {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'varchar' })
    complaint: string;

    @Column({ type: 'text' })
    diagnosis: string;

    @Column({ type: 'text' })
    treatment: string;

    @Column({ type: 'text' })
    notes: string;

    @Column({ type: 'date' })
    visitDate: string;

    @CreateDateColumn({ type: 'timestamp', default: () => CURRENT_TIMESTAMP })
    createdAt: Date;

    @UpdateDateColumn({ type: 'timestamp', default: () => CURRENT_TIMESTAMP, onUpdate: CURRENT_TIMESTAMP })
    updatedAt: Date;

    // المريض
    @ManyToOne(() => Patient, (patient) => patient.visits, { onDelete: 'CASCADE' })
    patient: Patient;

    // الدكتور — يتملى تلقائياً من الـ JWT
    @ManyToOne(() => Users, { onDelete: 'SET NULL', nullable: true })
    @JoinColumn({ name: 'doctorId' })
    doctor: Users;

    // الموعد المرتبط — اختياري
    @ManyToOne(() => Appointment, { onDelete: 'SET NULL', nullable: true })
    @JoinColumn({ name: 'appointmentId' })
    appointment: Appointment;

    // الوصفات الطبية
    @OneToMany(() => Prescription, (prescription) => prescription.visit, { cascade: true })
    prescriptions: Prescription[];
}