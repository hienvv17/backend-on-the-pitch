import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  JoinColumn,
} from 'typeorm';
import { BranchsEntity } from './branches.entity';
import { UsersEntity } from './users.entity';
import { OrderDetail } from './order-detail.entity';

@Entity('orders')
export class Orders {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'branch_id' })
  branchId: number;

  @ManyToOne(() => BranchsEntity)
  @JoinColumn({ name: 'branch_id' })
  branch: BranchsEntity;

  @Column({ name: 'user_id', nullable: true })
  userId: number;

  @ManyToOne(() => UsersEntity, { nullable: true })
  @JoinColumn({ name: 'user_id' })
  user: UsersEntity;

  @OneToMany(() => OrderDetail, (detail) => detail.order, { cascade: true })
  orderDetails: OrderDetail[];

  @Column({ type: 'int', name: 'total_price' })
  totalPrice: number;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;

  @Column({ type: 'varchar', length: 100, name: 'created_by' })
  createdBy: string;
}
