import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThanOrEqual, Repository } from 'typeorm';
import { CreateStaffDto } from './dtos/create-staff.dto';
import moment from 'moment';
import { StaffEntity } from '../entities/staff.entity';
import { FirebaseAdmin } from '../firebase/firebase.service';
import { StaffBranchEntity } from 'src/entities/staff_branch.entity';

@Injectable()
export class StaffService {
  constructor(
    @InjectRepository(StaffEntity)
    private staffRepository: Repository<StaffEntity>,
    @InjectRepository(StaffBranchEntity)
    private staffBranchRepo: Repository<StaffBranchEntity>,
    private firebaseAdmin: FirebaseAdmin,
  ) {}

  async create(createStaffDto: CreateStaffDto): Promise<StaffEntity> {
    const existingStaff = await this.staffRepository.findOne({
      where: { email: createStaffDto.email },
    });
    if (existingStaff) {
      throw new Error('Staff already exists');
    }
    const admin = this.firebaseAdmin.setup();
    const newStaffData = await admin.auth().createUser({
      email: createStaffDto.email,
    });
    const newStaff = await this.staffRepository.save(
      this.staffRepository.create({
        ...createStaffDto,
        uid: newStaffData.uid,
      }),
    );
    if (createStaffDto.branchIds && createStaffDto.branchIds.length > 0) {
      await this.createStaffBranch(newStaff.id, createStaffDto.branchIds);
    }

    return newStaff;
  }

  async createStaffBranch(staffId: number, branchIds: string[]) {
    /**
     * check staff has working branches
     * if not, create new staff branch
     */
    if (branchIds && branchIds.length > 0) {
      const existingStaffBranch = await this.staffBranchRepo.find({
        where: { staffId },
        select: ['branchId'],
      });
      const existingBranchIds = existingStaffBranch.map(
        (branch) => branch.branchId,
      );
      const newBranchIds = branchIds.filter(
        (branchId) => !existingBranchIds.includes(Number(branchId)),
      );
      if (newBranchIds.length > 0) {
        const staffBranches = newBranchIds.map((branchId) => ({
          staffId,
          branchId: Number(branchId),
        }));
        await this.staffBranchRepo.save(staffBranches);
      }
      const staffBranchesToRemove = existingStaffBranch.filter(
        (branch) => !branchIds.includes(String(branch.branchId)),
      );
      if (staffBranchesToRemove.length > 0) {
        await this.staffBranchRepo.remove(staffBranchesToRemove);
      }
    }
  }

  async getAll(): Promise<StaffEntity[]> {
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

  async findByEmail(email: string): Promise<StaffEntity> {
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
