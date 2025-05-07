import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { VoucherType } from './vouchers.entity';

@Entity()
export class VoucherConfig {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'enum', enum: VoucherType, unique: true })
  type: VoucherType;

  @Column({ name: 'voucherCode', type: 'varchar', length: 10, unique: true })
  voucherCode: string;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @Column({ name: 'percent_discount', type: 'int' })
  percentDiscount: number;

  @Column({ name: 'max_discount_amount', type: 'int' })
  maxDiscountAmount: number;

  @Column({ name: 'valid_days', type: 'int' })
  validDays: number;

  @Column({ name: 'amount_to_trigger', type: 'int', nullable: true })
  amountToTrigger: number;
}
