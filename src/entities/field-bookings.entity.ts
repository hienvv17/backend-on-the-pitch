import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { UsersEntity } from './users.entity';
import { SportFieldsEntity } from './sport-fields.entity';
import { RefundsEntity } from './refund.entity';

export const FieldBookingStatus = {
  PENDING: 'PENDING',
  CONFIRMED: 'CONFIRMED',
  CANCELLED: 'CANCELLED',
  PENDING_PAYMENT: 'PENDING_PAYMENT',
  PAID: 'PAID',
  REFUND: 'REFUND',
} as const;

@Entity('field_bookings')
export class FieldBookingsEntity {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ type: 'varchar', length: 12 })
  code: string;

  @Column({ type: 'bigint', name: 'user_id' })
  userId: number;

  @Column({ type: 'bigint', name: 'sport_field_id' })
  sportFieldId: number;

  @ManyToOne(() => UsersEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: UsersEntity;

  @ManyToOne(() => SportFieldsEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'sport_field_id' })
  sportField: SportFieldsEntity;

  // Other Columns
  @Column({ type: 'date', name: 'booking_date' })
  bookingDate: string; // e.g., '2025-03-22'

  @Column({ type: 'varchar', length: 5, name: 'start_time' })
  startTime: string; // e.g., '05:30'

  @Column({ type: 'varchar', length: 5, name: 'end_time' })
  endTime: string; // e.g., '07:30'
  // Pricing
  @Column({ type: 'int', name: 'total_price' })
  totalPrice: number; // Calculated based on time slots

  @Column({ type: 'int', name: 'origin_price' })
  originPrice: number; // Original price before any discounts if not it equal to total price

  @Column({ type: 'int', name: 'discount_amount', nullable: true })
  discountAmount: number; // Discount amount applied

  @Column({ type: 'varchar', name: 'voucher_code', nullable: true })
  voucherCode: string; // Voucher code applied

  @Column({ type: 'boolean', name: 'sent_mail', default: false })
  sentMail: boolean; // sent mail to user

  @Column({ type: 'int', name: 'total_retry_send_mail', default: 0 })
  totalRetrySendMail: number; // Total retry send mail count

  @Column({
    type: 'enum',
    enum: FieldBookingStatus,
    default: FieldBookingStatus.PENDING,
  })
  status: string;

  @Column({ type: 'date', name: 'latest_payment_date', nullable: true })
  latestPaymentDate: string;

  @OneToMany(() => RefundsEntity, (refund) => refund.fieldBooking)
  refunds: RefundsEntity[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
