import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  JoinColumn,
} from 'typeorm';
import { SportItemsEntity } from './sport-items.entity';
import { Orders } from './order.entity';

@Entity('order_details')
export class OrderDetail {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'order_id' })
  orderId: number;

  @ManyToOne(() => Orders, (order) => order.orderDetails)
  @JoinColumn({ name: 'order_id' })
  order: Orders;

  @Column({ name: 'sport_item_id' })
  sportItemId: number;

  @ManyToOne(() => SportItemsEntity)
  @JoinColumn({ name: 'sport_item_id' })
  sportItem: SportItemsEntity;

  @Column({ type: 'int' })
  quantity: number;

  @Column({ type: 'int' })
  price: number;

  @Column({ type: 'int' })
  total: number; // total = price * quantity
}
