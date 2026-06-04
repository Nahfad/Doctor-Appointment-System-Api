import { Appointment } from "src/appointment/appointment.entity";
import { CURRENT_TIMESTAMP } from "src/utils/constants";
import { DoctorSpeciality } from "src/utils/enums";
import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";




@Entity({ name: 'Doctors' })
export class Doctor {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column({ nullable: true })
    imageUrl: string;

    @Column({ type: 'enum', enum: DoctorSpeciality })
    speciality: DoctorSpeciality

    @Column()
    experienceYears: number;

    @Column()
    about: string;

    @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
    fees: number;

    @Column({ type: 'jsonb', default: {} })
    slots_booked: {
        [date: string]: string[]; // { "2024-03-15": ["10:00 AM", "2:00 PM"] }
    };

    @CreateDateColumn({ type: 'timestamp', default: () => CURRENT_TIMESTAMP })
    createdAt: Date;

    @UpdateDateColumn({ type: 'timestamp', default: () => CURRENT_TIMESTAMP, onUpdate: CURRENT_TIMESTAMP })
    updatedAt: Date;

    // الدكتور الواحد لدية اكثر من معاد
    @OneToMany(() => Appointment, (appointment) => appointment.doctor)
    appointments: Appointment[];


}
