import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('user')
export class UserEntity {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ type: 'varchar', length: 128, unique: true })
  uid: string;

  @Column({ name: 'full_name', type: 'varchar', length: 255, nullable: true })
  fullName?: string;

  @Column({ name: 'phone_number', type: 'varchar', length: 10, nullable: true })
  phoneNumber?: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
