import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { StaffBranchEntity } from './staff_branch.entity';
import { SportFieldsEntity } from './sport-fields.entity';

@Entity('branches')
export class BranchsEntity {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 255 })
  street: string;

  @Column({ type: 'varchar', length: 100 })
  ward: string;

  @Column({ type: 'varchar', length: 100 })
  district: string;

  @Column({ type: 'varchar', length: 100 })
  city: string;

  @Column({ type: 'json', nullable: true })
  images?: string[];

  @Column({ nullable: true, type: 'varchar', length: 30 })
  longtitude?: string;

  @Column({ nullable: true, type: 'varchar', length: 30 })
  latitude?: string;

  @Column({
    name: 'active_date',
    type: 'date',
    default: () => 'CURRENT_TIMESTAMP',
  })
  activeDate: Date;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @Column({ name: 'is_hot', type: 'boolean', default: true })
  isHot: boolean;

  @Column({ name: 'open_time', type: 'varchar', length: 5 })
  openTime: string;

  @Column({ name: 'close_time', type: 'varchar', length: 5 })
  closeTime: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => StaffBranchEntity, (staffBranch) => staffBranch.branch)
  staffBranches: StaffBranchEntity[];

  @OneToMany(() => SportFieldsEntity, (sportField) => sportField.branch)
  fieldBranches: SportFieldsEntity[];
}
