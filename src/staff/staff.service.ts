import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { StaffEntity } from '@src/entities/staff.entity';
import { LessThanOrEqual, Repository } from 'typeorm';
import { CreateStaffDto } from './dtos/create-staff.dto';
import * as moment from 'moment';
import { BranchEntity } from '@src/entities/branch.entity';
import { StaffBranchEntity } from '@src/entities/staff-branch.entity';

@Injectable()
export class StaffService {
  constructor(
    @InjectRepository(StaffEntity)
    private readonly staffRepository: Repository<StaffEntity>,
    @InjectRepository(BranchEntity)
    private readonly branchRepository: Repository<BranchEntity>,
    @InjectRepository(StaffBranchEntity)
    private readonly staffBranchRepository: Repository<StaffBranchEntity>,
  ) {}

  async create(createStaffDto: CreateStaffDto): Promise<StaffEntity> {
    const branch = await this.branchRepository.findOne({
      where: { id: createStaffDto.branchId },
    });
    if (!branch) {
      throw new NotFoundException('Branch not found');
    }
    delete createStaffDto.branchId;
    const newStaff = await this.staffRepository.save(
      this.staffRepository.create(),
    );
    await this.staffBranchRepository.save(
      this.staffBranchRepository.create({
        staffId: newStaff.id,
        branchId: branch.id,
      }),
    );

    return newStaff;
  }

  async findAll(): Promise<StaffEntity[]> {
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
