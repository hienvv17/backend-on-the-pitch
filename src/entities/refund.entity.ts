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
  PENDING = 'PENDING', // mean requested from customer waiting handle
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  PROCESSING = 'PROCESSING',
  FAILED = 'FAILED',
  COMPLETED = 'COMPLETED',
}

@Entity('refunds')
export class RefundsEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'field_booking_id' })
  fieldBookingId: number;

  @Column({ name: 'app_refund_id', nullable: true, type: 'varchar' })
  appRefundId: string;

  @Column({ name: 'app_refund_id', nullable: true, type: 'varchar' })
  refundId: string; // return from zaloPay to call back checking

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

  @Column({ type: 'varchar', nullable: true, name: 'transaction_id' })
  transactionId: string; // Refund transaction ID from ZaloPay

  @Column({ type: 'varchar', nullable: true, name: 'failed_reason' })
  failedReason: string; // Refund failed reason from ZaloPay

  @Column({ type: 'varchar', nullable: true, name: 'payment_method' })
  paymentMethod: string; // 'CASH', 'ZaloPay'

  @Column({ type: 'varchar', nullable: true, name: 'updated_by' })
  updatedBy: string;

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
