import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';

import { BranchsEntity } from './branches.entity';
import { SportCategoriesEntity } from './sport-categories.entity';
import { TimeSlotsEntity } from './time-slots.entity';

@Entity('sport_fields')
export class SportFieldsEntity {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ name: 'branch_id', type: 'bigint' })
  branchId: number;

  @Column({ name: 'sport_category_id', type: 'bigint' })
  sportCategoryId: number;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @Column({ name: 'default_price', type: 'bigint' })
  defaultPrice: number;

  @Column({ type: 'json' })
  images?: any;

  @Column({ type: 'text' })
  description?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => BranchsEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'branch_id' })
  branch: BranchsEntity;

  @ManyToOne(() => SportCategoriesEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'sport_category_id' })
  sportCategory: SportCategoriesEntity;

  @OneToMany(() => TimeSlotsEntity, (timeSlot) => timeSlot.sportField)
  timeSlots: TimeSlotsEntity[];
}
