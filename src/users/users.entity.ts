import { Appointment } from 'src/appointment/appointment.entity';
import { CURRENT_TIMESTAMP } from 'src/utils/constants';
import { UserType } from 'src/utils/enums';
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

    @Column()
    name: string;

    @Column({ unique: true })
    email: string;

    @Column()
    password: string;

    @Column({ type: 'enum', enum: UserType, default: UserType.User })
    userType: UserType;

    @Column({ default: 'default_user.png' })
    imageUrl: string;

    @Column({ type: 'varchar', length: 11, unique: true, nullable: true })
    phone: string;

    @CreateDateColumn({ type: 'timestamp', default: () => CURRENT_TIMESTAMP })
    createdAt: Date;

    @UpdateDateColumn({ type: 'timestamp', default: () => CURRENT_TIMESTAMP, onUpdate: CURRENT_TIMESTAMP })
    updatedAt: Date;

    // اليوزر الواحد يقدر يحجز اكثر من معاد
    @OneToMany(() => Appointment, (appointment) => appointment.user)
    appointments: Appointment[];

}