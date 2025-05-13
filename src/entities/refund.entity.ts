import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { FieldBookingsEntity } from './field-bookings.entity';

export enum RefundStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  COMPLETED = 'COMPLETED',
}

@Entity('refunds')
export class RefundsEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'field_booking_id' })
  fieldBookingId: number;

  @Column({ name: 'user_id' })
  userId: number;

  @ManyToOne(() => FieldBookingsEntity, (booking) => booking.refunds, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  @JoinColumn({ name: 'field_booking_id' }) // explicitly sets the foreign key column
  fieldBooking: FieldBookingsEntity;

  @Column({ type: 'int', nullable: true })
  amount: number;

  @Column({ type: 'enum', enum: RefundStatus, default: RefundStatus.PENDING })
  status: RefundStatus;

  @Column({ type: 'text', nullable: true })
  reason: string;

  @Column({ name: 'admin_note', type: 'text', nullable: true })
  adminNote: string;

  @Column({ type: 'varchar', nullable: true })
  transactionId: string; // Refund transaction ID from ZaloPay

  @Column({ type: 'varchar', nullable: true })
  paymentMethod: string; // 'CASH', 'ZaloPay'

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;

  @UpdateDateColumn({
    name: 'updated_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date;
}
