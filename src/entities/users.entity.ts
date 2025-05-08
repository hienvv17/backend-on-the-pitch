import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { VouchersEntity } from './vouchers.entity';

@Entity('users')
export class UsersEntity {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ type: 'varchar', length: 128, unique: true })
  uid: string;

  @Column({ name: 'full_name', type: 'varchar', length: 255, nullable: true })
  fullName?: string;

  @Column({ name: 'phone_number', type: 'varchar', length: 10, nullable: true })
  phoneNumber?: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  @Column({ nullable: true })
  image?: string;

  @Column({ name: 'birth_date', type: 'date', nullable: true })
  birthDate?: Date;

  @Column({ nullable: true })
  date: number;

  @Column({ nullable: true })
  month: number;

  @OneToMany(() => VouchersEntity, (voucher) => voucher.user)
  vouchers: VouchersEntity[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
