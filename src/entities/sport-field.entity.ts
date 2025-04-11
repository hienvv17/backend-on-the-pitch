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

import { BranchEntity } from './branch.entity';
import { SportCategoryEntity } from './sport-category.entity';
import { TimeSlotEntity } from './time-slot.entity';

@Entity('sport_field')
export class SportFieldEntity {
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

  @Column({ type: 'json' })
  images?: any;

  @Column({ type: 'text' })
  description?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => BranchEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'branch_id' })
  branch: BranchEntity;

  @ManyToOne(() => SportCategoryEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'sport_category_id' })
  sportCategory: SportCategoryEntity;

  @OneToMany(() => TimeSlotEntity, (timeSlot) => timeSlot.sportField)
  timeSlots: TimeSlotEntity[];
}
