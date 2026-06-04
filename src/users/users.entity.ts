import { Appointment } from 'src/appointment/appointment.entity';
import { CURRENT_TIMESTAMP } from 'src/utils/constants';
import { Gender, UserStatus, UserType } from 'src/utils/enums';
import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    OneToMany,
} from 'typeorm';


@Entity('users')
export class Users {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'varchar', length: 100 })
    name: string;

    @Column({ type: 'varchar', unique: true })
    email: string;

    @Column({ type: 'varchar', select: false })
    password: string;

    @Column({ type: 'varchar', length: 20, nullable: true, unique: true })
    phone: string;

    @Column({ type: 'enum', enum: UserType })
    userType: UserType;

    @Column({
        type: 'enum',
        enum: UserStatus,
        default: UserStatus.ACTIVE,
    })
    status: UserStatus;

    // for doctor
    @Column({ type: 'varchar', nullable: true })
    specialization: string;

    @Column({ type: 'varchar', nullable: true })
    imageUrl: string;

    @CreateDateColumn({ type: 'timestamp', default: () => CURRENT_TIMESTAMP })
    createdAt: Date;

    @UpdateDateColumn({ type: 'timestamp', default: () => CURRENT_TIMESTAMP, onUpdate: CURRENT_TIMESTAMP })
    updatedAt: Date;

    // اليوزر الواحد يقدر يحجز اكثر من معاد
    @OneToMany(() => Appointment, (appointment) => appointment.user)
    appointments: Appointment[];

}