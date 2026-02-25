import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
} from 'typeorm';

@Entity('patients')
export class Patient {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    name: string;

    @Column({ unique: true })
    email: string;

    @Column()
    password: string;

    @Column({ nullable: true, type: 'text', default: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUA' })
    image: string;

    @Column({ type: 'jsonb', default: { line1: '', line2: '' } })
    address: {
        line1: string;
        line2: string;
    };

    @Column({ default: 'Not Selected' })
    gender: string;

    @Column({ default: 'Not Selected' })
    dob: string;

    @Column({ default: '0000000000' })
    phone: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}