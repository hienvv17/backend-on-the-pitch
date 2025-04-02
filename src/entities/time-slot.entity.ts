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

  @Column({ type: 'varchar', length: 5, name: 'start_time' })
  startTime: string;

  @Column({ type: 'varchar', length: 5, name: 'end_time' })
  endTime: string;

  @Column({ type: 'int', name: 'price_per_hour' })
  pricePerHour: number;

  @Column({ type: 'boolean', default: true, name: 'is_active' })
  isActive: boolean;

  @Column({ type: 'boolean', default: false, name: 'is_deleted' })
  isDeleted: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => SportFieldEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'sport_field_id' })
  sportField: SportFieldEntity;
}
