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
import { TimeSlotEntity } from './time-slot.entity';

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

  @Column({ type: 'bigint', name: 'begin_time_slot_id' })
  beginTimeSlotId: number;

  @ManyToOne(() => TimeSlotEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'begin_time_slot_id' })
  beginTimeSlot: TimeSlotEntity;

  @Column({ type: 'bigint', name: 'end_time_slot_id' })
  endTimeSlotId: number;

  @ManyToOne(() => TimeSlotEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'end_time_slot_id' })
  endTimeSlot: TimeSlotEntity;

  // Pricing
  @Column({ type: 'decimal', precision: 10, scale: 2, name: 'total_price' })
  totalPrice: number; // Calculated based on time slots

  // Other Columns
  @Column({ type: 'date', name: 'booking_date' })
  bookingDate: string; // e.g., '2025-03-22'

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
