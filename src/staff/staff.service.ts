import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThanOrEqual, Repository } from 'typeorm';
import { CreateStaffDto } from './dtos/create-staff.dto';
import moment from 'moment';
import { StaffEntity } from '../entities/staff.entity';

@Injectable()
export class StaffService {
  constructor(
    @InjectRepository(StaffEntity)
    private readonly staffRepository: Repository<StaffEntity>,
  ) {}

  async create(createStaffDto: CreateStaffDto): Promise<StaffEntity> {
    const newStaff = this.staffRepository.create(createStaffDto);
    return await this.staffRepository.save(newStaff);
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
