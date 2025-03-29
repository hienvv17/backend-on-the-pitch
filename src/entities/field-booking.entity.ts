import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
} from 'typeorm';
import { UserEntity } from './user.entity';
import { SportFieldEntity } from './sport-field.entity';

export const FieldBookingStatus = {
  PENDING: 'PENDING',
  CONFIRMED: 'CONFIRMED',
  CANCELLED: 'CANCELLED',
  PENDING_PAYMENT: 'PENDING_PAYMENT',
  PAID: 'PAID',
  REFUND: 'REFUND',
} as const;

@Entity('field_booking')
export class FieldBookingEntity {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ type: 'bigint', name: 'user_id' })
  userId: number;

  @Column({ type: 'bigint', name: 'sport_field_id' })
  sportFieldId: number;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  @ManyToOne(() => SportFieldEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'sport_field_id' })
  sportField: SportFieldEntity;

  // Other Columns
  @Column({ type: 'date', name: 'booking_date' })
  bookingDate: string; // e.g., '2025-03-22'

  @Column({ type: 'varchar', length: 5, name: 'begin_time' })
  beginTime: string; // e.g., '05:30'

  @Column({ type: 'varchar', length: 5, name: 'end_time' })
  endTime: string; // e.g., '07:30'
  // Pricing
  @Column({ type: 'int', name: 'total_price' })
  totalPrice: number; // Calculated based on time slots

  @Column({
    type: 'enum',
    enum: FieldBookingStatus,
    default: FieldBookingStatus.PENDING,
  })
  status: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
