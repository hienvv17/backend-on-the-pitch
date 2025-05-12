import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
} from 'typeorm';
import { FieldBookingsEntity } from './field-bookings.entity';

export const PaymentGateway = {
  ZALOPAY: 'ZALOPAY',
  MOMO: 'MOMO',
  CASH: 'CASH', // Optional: support other gateways in the future
} as const;

export type PaymentGatewayType =
  (typeof PaymentGateway)[keyof typeof PaymentGateway];

export enum PaymentStatus {
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
  PENDING = 'PENDING',
}

@Entity('payments')
export class PaymentsEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'varchar',
    length: 50,
    name: 'app_transaction_id',
    nullable: true,
  })
  appTransactionId: string; // From app generator

  @Column({
    type: 'varchar',
    length: 50,
    name: 'transaction_id',
    nullable: true,
  })
  transactionId: string; // From payment gateway

  @Column({
    type: 'varchar',
    length: 500,
    name: 'order_url',
    nullable: true,
  })
  orderUrl: string;
  @Column({
    type: 'enum',
    enum: PaymentGateway,
    default: PaymentGateway.ZALOPAY,
  })
  gateway: PaymentGatewayType;

  @Column({ type: 'enum', enum: PaymentStatus, default: PaymentStatus.PENDING })
  status: PaymentStatus;

  @Column({ type: 'int' })
  amount: number; // Total amount paid

  @Column({ type: 'varchar', nullable: true, name: 'payment_method' })
  paymentMethod: string; // e.g., 'ATM', 'CC', 'ZaloPay App'

  @ManyToOne(() => FieldBookingsEntity, (booking) => booking.id, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'field_booking_id' })
  fieldBooking: FieldBookingsEntity;

  @Column({ type: 'bigint', name: 'field_booking_id' })
  fieldBookingId: number;

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
