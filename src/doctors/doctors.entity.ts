import { CURRENT_TIMESTAMP } from "src/utils/constans";
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";


@Entity({ name: 'Doctors' })
export class Doctor {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column({ unique: true })
    email: string;

    @Column()
    password: string;

    @Column({ nullable: true })
    imageUrl: string;

    @Column()
    speciality: string;

    @Column()
    degree: string;

    @Column()
    experience: string;

    @Column()
    about: string;

    @Column({ default: true })
    available: boolean;

    @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
    fees: number;

    @Column('simple-json', { nullable: true })
    address: object

    @Column({ type: 'simple-json', default: {} })
    slotsBooked: object;

    @CreateDateColumn({ type: 'timestamp', default: () => CURRENT_TIMESTAMP })
    createdAt: Date;

    @UpdateDateColumn({ type: 'timestamp', default: () => CURRENT_TIMESTAMP, onUpdate: CURRENT_TIMESTAMP })
    updatedAt: Date;
}
