import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { UsersEntity } from './users.entity';

export const VoucherType = {
  BIRTHDAY: 'BIRTHDAY',
  LOYALTY: 'LOYALTY',
  REVIEW: 'REVIEW',
  MANUAL: 'MANUAL',
} as const;

export type VoucherType = (typeof VoucherType)[keyof typeof VoucherType];

export const VoucherStatus = {
  ACTIVE: 'ACTIVE',
  EXPIRED: 'EXPIRED',
  USED: 'USED',
} as const;

@Entity()
export class VouchersEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'enum', enum: VoucherType })
  type: VoucherType;

  @Column()
  code: string;

  @Column({ type: 'int', name: 'max_discount_amount' })
  maxDiscountAmount: number;

  @Column({ type: 'int', name: 'percent_discount' })
  percentDiscount: number;

  @Column({ type: 'date', nullable: true, name: 'valid_from' })
  validFrom: Date;

  @Column({ type: 'date', nullable: true, name: 'valid_to' })
  validTo: Date;

  @Column({ type: 'enum', enum: VoucherStatus, default: VoucherStatus.ACTIVE })
  status: typeof VoucherStatus;

  @Column({ name: 'user_id', type: 'bigint' })
  userId: number; // Only set for personalized vouchers (e.g., birthday, loyalty)

  @ManyToOne(() => UsersEntity, (user) => user.vouchers)
  @JoinColumn({ name: 'user_id' }) // This ensures the relation uses the `user_id` column
  user: UsersEntity;

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
