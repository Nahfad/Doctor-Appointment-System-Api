import {
    Entity, PrimaryGeneratedColumn, Column,
    CreateDateColumn, UpdateDateColumn,
} from 'typeorm';
import { UserType, UserStatus, DoctorSpeciality } from 'src/utils/enums';
import { CURRENT_TIMESTAMP } from 'src/utils/constants';

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

    @Column({ type: 'enum', enum: UserStatus, default: UserStatus.ACTIVE })
    status: UserStatus;

    // Doctor only fields
    @Column({ type: 'enum', enum: DoctorSpeciality, nullable: true })
    speciality: DoctorSpeciality;

    @Column({ type: 'int', nullable: true })
    experienceYears: number;

    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
    fees: number;

    @Column({ type: 'text', nullable: true })
    about: string;

    @Column({ type: 'varchar', nullable: true })
    imageUrl: string;

    @CreateDateColumn({ type: 'timestamp', default: () => CURRENT_TIMESTAMP })
    createdAt: Date;

    @UpdateDateColumn({ type: 'timestamp', default: () => CURRENT_TIMESTAMP, onUpdate: CURRENT_TIMESTAMP })
    updatedAt: Date;
}

