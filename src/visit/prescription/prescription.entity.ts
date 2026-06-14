import {
    Entity, PrimaryGeneratedColumn, Column,
    CreateDateColumn, ManyToOne,
} from 'typeorm';
import { Visit } from 'src/visit/visit.entity';

@Entity('prescriptions')
export class Prescription {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'varchar', length: 200 })
    medicineName: string;

    @Column({ type: 'varchar', length: 100 })
    dosage: string;

    @Column({ type: 'varchar', length: 100 })
    duration: string;

    @Column({ type: 'text' })
    instructions: string;

    @CreateDateColumn()
    createdAt: Date;

    @ManyToOne(() => Visit, (visit) => visit.prescriptions, { onDelete: 'CASCADE' })
    visit: Visit;
}