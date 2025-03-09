import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { SportItemEntity } from './sport-item.entity';
import { BranchEntity } from './branch.entity';

@Entity('sport_item_branch')
export class SportItemBranchEntity {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @ManyToOne(() => SportItemEntity, { onDelete: 'CASCADE' })
  sportItem: SportItemEntity;

  @ManyToOne(() => BranchEntity, { onDelete: 'CASCADE' })
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
