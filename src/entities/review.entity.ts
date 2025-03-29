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
import { FieldBookingEntity } from './field-booking.entity';

@Entity('review')
export class ReviewEntity {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ type: 'bigint', name: 'user_id' })
  userId: number;

  @Column({ type: 'bigint', name: 'field_booking_id' })
  fieldBookingId: number;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  @ManyToOne(() => FieldBookingEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'field_booking_id' })
  fieldBooking: FieldBookingEntity;

  @Column({ type: 'text', nullable: true })
  comment: string;

  @Column({ type: 'int', default: 5 })
  rating: number; // Rating scale (e.g., 1-5)

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
