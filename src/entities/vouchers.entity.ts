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

export enum VoucherType {
    ORDER = 'ORDER',
    BOOKING = 'BOOKING',
}

export enum VoucherStatus {
    ACTIVE = 'ACTIVE',
    INACTIVE = 'INACTIVE',
    EXPIRED = 'EXPIRED',
    USED = 'USED',
}

@Entity('vouchers')
export class VouchersEntity {
    @PrimaryGeneratedColumn('increment')
    id: number;

    @Column({ type: 'varchar', length: 100, unique: true })
    code: string;

    @Column({ type: 'enum', enum: VoucherType })
    type: VoucherType; // order | booking

    @Column({ type: 'enum', enum: VoucherStatus, default: VoucherStatus.ACTIVE })
    status: VoucherStatus;

    @Column({ type: 'bigint', name: 'discount_amount' })
    discountAmount: number;

    @Column({ type: 'date', name: 'expire_date' })
    expireDate: Date;

    @Column({ type: 'bigint', name: 'user_id', nullable: true })
    userId: number;

    @ManyToOne(() => UsersEntity, (user: UsersEntity) => user.vouchers, {
        onDelete: 'CASCADE',
        nullable: true,
    })
    @JoinColumn({
        name: 'user_id',
        referencedColumnName: 'id',
    })
    user: UsersEntity;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
}
