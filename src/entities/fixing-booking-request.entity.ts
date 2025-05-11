import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum FixedBookingRequestStatus {
  REQUESTED = 'REQUESTED',
  CANCELLED = 'CANCELLED',
  DONE = 'DONE',
}

export type FixedBookingRequestType =
  (typeof FixedBookingRequestStatus)[keyof typeof FixedBookingRequestStatus];

@Entity('fixed_booking_requests')
export class FixedBookingRequestEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100 })
  email: string;

  @Column({ type: 'varchar', length: 20, name: 'phone_number' })
  phoneNumber: string;

  @Column({
    type: 'enum',
    enum: FixedBookingRequestStatus,
    default: FixedBookingRequestStatus.REQUESTED,
  })
  status: FixedBookingRequestStatus;

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

  @Column({ type: 'varchar', length: 100, name: 'updated_by', nullable: true })
  updatedBy: string | null;
}
