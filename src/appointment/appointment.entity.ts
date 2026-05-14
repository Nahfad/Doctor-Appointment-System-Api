import { Doctor } from 'src/doctors/doctors.entity';
import { Users } from 'src/users/users.entity';
import { CURRENT_TIMESTAMP } from 'src/utils/constants';
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

    @Column({ type: 'timestamp' })
    date: Date;

    @CreateDateColumn({ type: 'timestamp', default: () => CURRENT_TIMESTAMP })
    createdAt: Date;

    @UpdateDateColumn({ type: 'timestamp', default: () => CURRENT_TIMESTAMP, onUpdate: CURRENT_TIMESTAMP })
    updatedAt: Date;

    // علاقة ManyToOne: الكثير من المواعيد تنتمي لمريض واحد
    @ManyToOne(() => Users, (user) => user.appointments, { onDelete: 'CASCADE' })
    user: Users;

    // علاقة ManyToOne: الكثير من المواعيد تنتمي لدكتور واحد
    @ManyToOne(() => Doctor, (doctor) => doctor.appointments, { onDelete: 'CASCADE' })
    doctor: Doctor;

}

