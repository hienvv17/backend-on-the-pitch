import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
} from 'typeorm';
import { StaffEntity } from './staff.entity';
import { BranchEntity } from './branch.entity';

@Entity('staff_branch')
export class StaffBranchEntity {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ type: 'int', name: 'staff_id' })
  staffId: number;

  @Column({ type: 'int', name: 'branch_id' })
  branchId: number;

  @Column({ type: 'boolean', default: false, name: 'is_deleted' })
  isDeleted: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => StaffEntity, (staff) => staff.staffBranches, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'staff_id' }) // Explicitly maps staffId to staff
  staff: StaffEntity;

  @ManyToOne(() => BranchEntity, (branch) => branch.staffBranches, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'branch_id' }) // Explicitly maps branchId to branch
  branch: BranchEntity;
}
