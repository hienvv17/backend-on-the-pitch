import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
} from 'typeorm';
import { SportItemsEntity } from './sport-items.entity';
import { BranchsEntity } from './branchs.entity';

@Entity('sport_item_branch')
export class SportItemBranchEntity {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ type: 'bigint', name: 'sport_item_id' })
  sportItemId: number;

  @Column({ type: 'bigint', name: 'branch_id' })
  branchId: number;

  @ManyToOne(() => SportItemsEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'sport_item_id' })
  sportItem: SportItemsEntity;

  @ManyToOne(() => BranchsEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'branch_id' })
  branch: BranchsEntity;

  @Column({ type: 'bigint' })
  quantity: number;

  @Column({ type: 'varchar', length: 100, name: 'last_modified_by' })
  lastModifiedBy: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
