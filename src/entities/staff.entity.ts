import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum STAFF_ROLE {
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  STAFF = 'STAFF',
}

@Entity('staff')
export class StaffEntity {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ type: 'varchar', length: 128 })
  uid: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  fullName?: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 11 })
  phoneNumber: string;

  @Column({
    type: 'enum',
    enum: STAFF_ROLE,
    enumName: 'staff_role',
    default: STAFF_ROLE.STAFF,
  })
  role: STAFF_ROLE;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  activeDate: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
