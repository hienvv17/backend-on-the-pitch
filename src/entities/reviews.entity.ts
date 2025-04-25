import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
} from 'typeorm';
import { UsersEntity } from './users.entity';
import { FieldBookingsEntity } from './field-bookings.entity';

@Entity('reviews')
export class ReviewsEntity {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ type: 'bigint', name: 'user_id' })
  userId: number;

  @Column({ type: 'bigint', name: 'field_booking_id' })
  fieldBookingId: number;

  @ManyToOne(() => UsersEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: UsersEntity;

  @ManyToOne(() => FieldBookingsEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'field_booking_id' })
  fieldBooking: FieldBookingsEntity;

  @Column({ type: 'text', nullable: true })
  comment: string;

  @Column({ type: 'boolean', nullable: true, name: 'is_deleted' })
  isDeleted: boolean;

  @Column({ type: 'boolean', nullable: true, name: 'is_hidden' })
  isHidden: boolean;

  @Column({ type: 'int', default: 5 })
  rating: number; // Rating scale (e.g., 1-5)

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
