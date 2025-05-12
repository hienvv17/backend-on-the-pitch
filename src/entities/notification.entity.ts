import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { UsersEntity } from './users.entity';

export const NotificationType = {
  INFO: 'INFO',
  ALERT: 'ALERT',
  REMINDER: 'REMINDER',
  SYSTEM: 'SYSTEM',
} as const;

export type _NotificationType =
  (typeof NotificationType)[keyof typeof NotificationType];

@Entity('notifications')
export class NotificationEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', name: 'user_id' })
  userId: string;

  // for manager, admin can see all notifications
  @Column({ type: 'int', name: 'branch_id', nullable: true })
  branchId: number;

  @ManyToOne(() => UsersEntity, (user) => user.notifications, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: UsersEntity;

  @Column({ type: 'text' })
  title: string;

  @Column({ type: 'text', nullable: true })
  message: string;

  @Column({
    type: 'enum',
    enum: NotificationType,
    default: 'INFO',
  })
  type: _NotificationType;

  @Column({ default: false })
  isRead: boolean;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    name: 'created_at',
  })
  createdAt: Date;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    name: 'updated_at',
  })
  updatedAt: Date;
}
