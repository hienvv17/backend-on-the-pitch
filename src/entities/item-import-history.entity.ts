import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { BranchsEntity } from './branches.entity';
import { SportItemsEntity } from './sport-items.entity';

@Entity('item_import_histories')
export class ItemImportHistory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'branch_id', type: 'bigint' })
  branchId: number;

  @ManyToOne(() => BranchsEntity)
  @JoinColumn({ name: 'branch_id' })
  branch: BranchsEntity;

  @Column({ name: 'sport_item_id', type: 'bigint' })
  sportItemId: number;

  @ManyToOne(() => SportItemsEntity)
  @JoinColumn({ name: 'sport_item_id' })
  sportItem: SportItemsEntity;

  @Column({ type: 'int' })
  quantity: number;

  @Column({ type: 'varchar', nullable: true })
  note: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Column({ type: 'varchar', length: 100, name: 'created_by' })
  createdBy: string;
}
