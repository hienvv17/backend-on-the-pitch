import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, QueryRunner, Repository } from 'typeorm';
import { CreateStaffDto } from './dtos/create-staff.dto';
import moment from 'moment';
import { STAFF_ROLE, StaffsEntity } from '../entities/staffs.entity';
import { FirebaseAdmin } from '../firebase/firebase.service';
import { StaffBranchEntity } from '../entities/staff_branch.entity';
import { UserRecord } from 'firebase-admin/lib/auth/user-record';
import { UpdateStaffDto } from './dtos/update-staff.dto';
import { BranchsEntity } from '../entities/branches.entity';

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
    private readonly dataSource: DataSource,
  ) {}

  async create(createStaffDto: CreateStaffDto) {
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
    if (existingStaff && !existingStaff.isDeleted) {
      throw new BadRequestException('Staff already exists');
    }
    if (existingStaff && existingStaff.isDeleted) {
      return await this.staffRepository.update(existingStaff.id, {
        fullName: createStaffDto.fullName,
        phoneNumber: createStaffDto.phoneNumber,
        role: createStaffDto.role,
        isActive: createStaffDto.isActive,
        activeDate: createStaffDto.activeDate,
        isDeleted: false,
        updatedAt: new Date(),
      });
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
      activeDate: updateStaffDto.activeDate,
      updatedAt: new Date(),
    });

    if (updateStaffDto.branchIds) {
      //empty array will remove all branches
      await this.createStaffBranch(id, updateStaffDto.branchIds);
    }
    return staff;
  }

  async createStaffBranch(staffId: number, branchIds: string[]): Promise<void> {
    if (branchIds && branchIds.length > 0) {
      const distinctBranchIds = [...new Set(branchIds)];
      const checkBranch = await this.branchesRepo.find({
        where: { id: In(distinctBranchIds) },
        select: { id: true },
      });
      if (distinctBranchIds.length != checkBranch.length) {
        throw new BadRequestException('Invalid branch list');
      }
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
            [staffId, branchId],
          );
        }
        await queryRunner.commitTransaction();
      } catch (error) {
        await queryRunner.rollbackTransaction();
        throw new Error(`Transaction failed: ${error.message}`);
      } finally {
        await queryRunner.release();
      }
    } else {
      await this.staffBranchRepo.update(
        { staffId: staffId },
        { isDeleted: true, updatedAt: new Date() },
      );
    }
    return;
  }

  async getAll(
    manager: Partial<StaffsEntity>,
    limit: number,
    offset: number,
    order: string,
    sortKey: string,
    branchId?: number,
    search: string = '',
  ) {
    const role = manager.role;
    let query = this.staffRepository
      .createQueryBuilder('staff')
      .leftJoin(
        'staff_branch',
        'sb',
        'sb.staff_id = staff.id AND sb.is_deleted = false',
      )
      .leftJoin('branches', 'b', 'b.id = sb.branch_id') // assuming relation name is `branches`
      .where('staff.isDeleted = false')
      .select([
        'staff.id "id"',
        'staff.fullName "fullName"',
        'staff.email "email"',
        'staff.phoneNumber "phoneNumber"',
        'staff.role "role"',
        'staff.isActive "isActive"',
        `TO_CHAR(staff.activeDate, 'YYYY-MM-DD') "activeDate"`,
        'staff.createdAt "createdAt"',
        'staff.updatedAt "updatedAt"',
      ])
      .addSelect(
        `COALESCE(
          json_agg(
            json_build_object(
              'id', b.id,
              'name', b.name
            )
          ) FILTER (WHERE b.id IS NOT NULL),
          '[]'
        )`,
        'branches',
      )
      .groupBy('staff.id');
    const sortBy = sortKey || 'staff.createdAt';
    query = query.orderBy(sortBy, order as any);
    if (role !== STAFF_ROLE.ADMIN) {
      query = query.andWhere('s.role != :role', { role: STAFF_ROLE.ADMIN });
    }
    const count = await query.getCount();

    query = query.limit(limit).offset(offset);
    if (search) {
      query = query.andWhere(
        '(s.fullName ILIKE :search OR s.email ILIKE :search OR s.phoneNumber ILIKE :search)',
        { search: `%${search}%` },
      );
    }
    if (branchId) {
      query = query.andWhere('sb.branch_id = :branchId', { branchId });
    }
    const staffs = await query.getRawMany();
    const items = staffs.map((staff) => ({
      ...staff,
      branchName: staff.branches.map((item) => `${item.name}`).join(', '),
    }));
    return {
      items,
      count,
    };
  }

  async delete(id: number): Promise<void> {
    const result = await this.staffRepository.update(
      { id: id },
      { isActive: false, isDeleted: true, updatedAt: new Date() },
    );
    if (result.affected === 0) {
      throw new NotFoundException(`Staff with ID ${id} not found`);
    }
    return;
  }

  async findByEmail(email: string): Promise<StaffsEntity> {
    const staffWithBranchIds = await this.staffRepository
      .createQueryBuilder('staff')
      .leftJoin(
        'staff_branch',
        'sb',
        'sb.staffId = staff.id AND sb.isDeleted = false',
      )
      .where('staff.email = :email', { email })
      .andWhere('staff.isActive = true')
      .andWhere('staff.isDeleted = false')
      .andWhere('staff.activeDate <= :today', {
        today: moment().format('YYYY-MM-DD'),
      })
      .select([
        'staff.id AS id',
        'staff.uid AS uid',
        'staff.email AS email',
        'staff.phoneNumber AS phoneNumber',
        'staff.role AS role',
        'ARRAY_AGG(sb.branchId) FILTER (WHERE sb.branchId IS NOT NULL) AS branchIds',
      ])
      .groupBy('staff.id')
      .getRawOne();

    return staffWithBranchIds;
  }
}
