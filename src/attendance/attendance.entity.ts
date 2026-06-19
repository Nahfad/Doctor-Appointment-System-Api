import { Users } from 'src/users/users.entity';
import { CURRENT_TIMESTAMP } from 'src/utils/constants';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';

@Entity('attendance')
@Unique(['doctor', 'workDate'])
export class Attendance {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Users, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'doctorId' })
  doctor: Users;

  @Column({ type: 'date' })
  workDate: string;

  @Column({ type: 'timestamp' })
  checkInTime: Date;

  @Column({ type: 'timestamp', nullable: true })
  checkOutTime: Date | null;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  @Column({
    type: 'decimal',
    precision: 5,
    scale: 2,
    nullable: true,
    transformer: {
      to: (value: number | null) => value,
      from: (value: string | null) =>
        value === null ? null : parseFloat(value),
    },
  })
  hoursWorked: number | null;

  @CreateDateColumn({ type: 'timestamp', default: () => CURRENT_TIMESTAMP })
  createdAt: Date;

  @UpdateDateColumn({
    type: 'timestamp',
    default: () => CURRENT_TIMESTAMP,
    onUpdate: CURRENT_TIMESTAMP,
  })
  updatedAt: Date;
}
