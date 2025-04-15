import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, LessThanOrEqual, QueryRunner, Repository } from 'typeorm';
import { CreateStaffDto } from './dtos/create-staff.dto';
import moment from 'moment';
import { StaffsEntity } from '../entities/staffs.entity';
import { FirebaseAdmin } from '../firebase/firebase.service';
import { StaffBranchEntity } from '../entities/staff_branch.entity';
import { UserRecord } from 'firebase-admin/lib/auth/user-record';
import { UpdateStaffDto } from './dtos/update-staff.dto';
import { BranchsEntity } from '../entities/branchs.entity';

@Injectable()
export class StaffsService {
  constructor(
    @InjectRepository(StaffsEntity)
    private staffRepository: Repository<StaffsEntity>,
    @InjectRepository(StaffBranchEntity)
    private staffBranchRepo: Repository<StaffBranchEntity>,
    @InjectRepository(BranchsEntity)
    private branchesRepo: Repository<BranchsEntity>,
    private firebaseAdmin: FirebaseAdmin,
    private readonly dataSource: DataSource
  ) { }

  async create(createStaffDto: CreateStaffDto): Promise<StaffsEntity> {
    const admin = this.firebaseAdmin.setup();
    let existingFirebaseUser: UserRecord = null;
    try {
      existingFirebaseUser = await admin
        .auth()
        .getUserByEmail(createStaffDto.email);
    } catch (error) {
      if (error.code === 'auth/user-not-found') {
        existingFirebaseUser = await admin.auth().createUser({
          email: createStaffDto.email,
        });
      } else {
        throw error;
      }
    }
    const existingStaff = await this.staffRepository.findOne({
      where: { email: createStaffDto.email },
    });
    if (existingStaff) {
      throw new Error('Staff already exists');
    }
    const newStaff = await this.staffRepository.save(
      this.staffRepository.create({
        ...createStaffDto,
        uid: existingFirebaseUser.uid,
      }),
    );
    if (createStaffDto.branchIds && createStaffDto.branchIds.length > 0) {
      await this.createStaffBranch(newStaff.id, createStaffDto.branchIds);
    }
    return newStaff;
  }

  async update(
    id: number,
    updateStaffDto: UpdateStaffDto,
  ): Promise<StaffsEntity> {
    const staff = await this.staffRepository.findOne({ where: { id } });
    if (!staff) {
      throw new NotFoundException(`Staff with ID ${id} not found`);
    }
    await this.staffRepository.update(id, {
      fullName: updateStaffDto.fullName,
      phoneNumber: updateStaffDto.phoneNumber,
      role: updateStaffDto.role,
      isActive: updateStaffDto.isActive,
      updatedAt: new Date()
    });

    if (updateStaffDto.branchIds && updateStaffDto.branchIds.length > 0) {
      await this.createStaffBranch(id, updateStaffDto.branchIds);
    }
    return staff;
  }

  async createStaffBranch(staffId: number, branchIds: string[]): Promise<void> {
    if (branchIds && branchIds.length > 0) {
      const distinctBranchIds = [...new Set(branchIds)]
      const checkBranch = await this.branchesRepo.find({ where: { id: In(distinctBranchIds) }, select: { id: true } })
      if(distinctBranchIds.length != checkBranch.length)
      { throw new BadRequestException("Invalid branch list")}
      const queryRunner: QueryRunner = this.dataSource.createQueryRunner();
          await queryRunner.connect();
          await queryRunner.startTransaction();
          try {
            await queryRunner.query(
              `UPDATE staff_branch SET is_deleted = true  WHERE staff_id = $1`,
              [staffId],
            );
            for (const branchId of distinctBranchIds) {
              await queryRunner.query(
                `INSERT INTO staff_branch (staff_id, branch_id)
                 VALUES ($1, $2)`,
                [staffId, branchId]
              );
            }
            await queryRunner.commitTransaction();
          } catch (error) {
            await queryRunner.rollbackTransaction();
            throw new Error(`Transaction failed: ${error.message}`);
          } finally {
            await queryRunner.release();
          }
    }
    return;
  }

  async getAll(): Promise<StaffsEntity[]> {
    return await this.staffRepository.find();
  }

  async remove(id: number): Promise<void> {
    const result = await this.staffRepository.update(
      { id: id },
      { isActive: false },
    );
    if (result.affected === 0) {
      throw new NotFoundException(`Staff with ID ${id} not found`);
    }
    return;
  }

  async findByEmail(email: string): Promise<StaffsEntity> {
    const activeStaff = await this.staffRepository.findOne({
      where: {
        email: email,
        isActive: true,
        activeDate: LessThanOrEqual(new Date(moment().format('YYYY-MM-DD'))),
      },
      select: ['id', 'uid', 'email', 'phoneNumber', 'role'],
    });
    return activeStaff;
  }
}
