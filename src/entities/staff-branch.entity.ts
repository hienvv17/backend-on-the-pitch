import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { StaffEntity } from './staff.entity';
import { BranchEntity } from './branch.entity';

@Entity('staff_branch')
export class StaffBranchEntity {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @ManyToOne(() => StaffEntity, { onDelete: 'CASCADE' })
  staff: StaffEntity;

  @ManyToOne(() => BranchEntity, { onDelete: 'CASCADE' })
  branch: BranchEntity;

  @Column({ type: 'boolean', default: false })
  isDeleted: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
