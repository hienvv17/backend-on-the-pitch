import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { SportFieldEntity } from './sport-field.entity';

@Entity('time_slot')
export class TimeSlotEntity {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ name: 'sport_field_id', type: 'int' })
  sportFieldId: number;

  @Column({ type: 'varchar', length: 5, name: 'start_time' }) // e.g., '16:30'
  startTime: string;

  @Column({ type: 'varchar', length: 5, name: 'end_time' }) // e.g., '17:30'
  endTime: string;

  @Column({ type: 'int', name: 'price_per_hour' })
  pricePerHour: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => SportFieldEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'sport_field_id' })
  sportField: SportFieldEntity;
}
