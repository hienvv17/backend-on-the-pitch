import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
} from 'typeorm';
import { SportItemEntity } from './sport-item.entity';
import { BranchEntity } from './branch.entity';

@Entity('sport_item_branch')
export class SportItemBranchEntity {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ type: 'bigint', name: 'sport_item_id' })
  sportItemId: number;

  @Column({ type: 'bigint', name: 'branch_id' })
  branchId: number;

  @ManyToOne(() => SportItemEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'sport_item_id' })
  sportItem: SportItemEntity;

  @ManyToOne(() => BranchEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'branch_id' })
  branch: BranchEntity;

  @Column({ type: 'bigint' })
  quantity: number;

  @Column({ type: 'varchar', length: 100, name: 'last_modified_by' })
  lastModifiedBy: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
