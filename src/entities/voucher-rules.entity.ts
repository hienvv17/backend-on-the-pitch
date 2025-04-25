import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
} from 'typeorm';

export enum VoucherTriggerType {
    MONTHLY_LOYALTY = 'MONTHLY_LOYALTY',
    BIRTHDAY = 'BIRTHDAY',
    INACTIVE_USER = 'INACTIVE_USER',
    MANUAL = 'MANUAL',
}

@Entity('voucher_rules')
export class VoucherRulesEntity {
    @PrimaryGeneratedColumn('increment')
    id: number;

    @Column({ type: 'varchar', length: 100, unique: true })
    ruleName: string;

    @Column({ type: 'enum', enum: VoucherTriggerType })
    triggerType: VoucherTriggerType;

    @Column({ type: 'enum', enum: ['ORDER', 'BOOKING'] })
    voucherType: 'ORDER' | 'BOOKING';

    @Column({ type: 'bigint' })
    discountAmount: number;

    @Column({ type: 'int', nullable: true })
    minBookingsPerMonth: number; // For loyalty

    @Column({ type: 'int', nullable: true })
    inactivityDays: number; // For inactive users

    @Column({ type: 'int', default: 1 })
    maxVouchersPerUser: number;

    @Column({ type: 'int', nullable: true })
    expireAfterDays: number;

    @Column({ type: 'boolean', default: true })
    autoGenerate: boolean;

    @Column({ type: 'timestamp', nullable: true })
    validFrom: Date;

    @Column({ type: 'timestamp', nullable: true })
    validTo: Date;

    @Column({ type: 'boolean', default: true })
    isActive: boolean;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
}
