import {
    Entity, PrimaryGeneratedColumn, Column,
    CreateDateColumn, UpdateDateColumn, DeleteDateColumn,
    OneToMany,
} from 'typeorm';
import { Gender } from 'src/utils/enums';
import { CURRENT_TIMESTAMP } from 'src/utils/constants';
import { Appointment } from 'src/appointment/appointment.entity';

@Entity('patients')
export class Patient {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'varchar', length: 100 })
    name: string;

    @Column({ type: 'varchar', length: 20, unique: true })
    phone: string;

    @Column({ type: 'int' })
    age: number;

    @Column({ type: 'enum', enum: Gender })
    gender: Gender;

    @Column({ type: 'varchar', length: 500, nullable: true })
    address: string;

    @Column({ type: 'text', nullable: true })
    notes: string;

    @CreateDateColumn({ type: 'timestamp', default: () => CURRENT_TIMESTAMP })
    createdAt: Date;

    @UpdateDateColumn({ type: 'timestamp', default: () => CURRENT_TIMESTAMP, onUpdate: CURRENT_TIMESTAMP })
    updatedAt: Date;

    // Soft Delete — مش بيتحذف نهائياً من الـ DB
    @DeleteDateColumn()
    deletedAt: Date;

    // مريض واحد يمكن أن يكون لديه مواعيد كثيرة.
    @OneToMany(() => Appointment, (appointment) => appointment.patient)
    appointments: Appointment[];

    // @OneToMany(
    //     () => Visit,
    //     (visit) => visit.patient,
    // )
    // visits: Visit[];
}