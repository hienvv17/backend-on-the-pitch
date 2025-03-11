import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BranchEntity } from '@src/entities/branch.entity';
import { Repository } from 'typeorm';
import { CreateBranchDto } from './dto/create-branch.dto';
import { UpdateBranchDto } from './dto/update-branch.dto';

@Injectable()
export class BranchService {
  constructor(
    @InjectRepository(BranchEntity)
    private readonly branchRepository: Repository<BranchEntity>,
  ) {}

  async create(data: CreateBranchDto): Promise<BranchEntity> {
    const branch = this.branchRepository.create(data);
    return await this.branchRepository.save(branch);
  }

  async findAll(): Promise<BranchEntity[]> {
    return await this.branchRepository.find();
  }

  async findOne(id: number): Promise<BranchEntity> {
    const branch = await this.branchRepository.findOne({ where: { id } });
    if (!branch) throw new NotFoundException('Branch not found');
    return branch;
  }

  async update(id: number, data: UpdateBranchDto) {
    const branch = await this.findOne(id);
    if (!branch) throw new NotFoundException('Branch not found');
    return await this.branchRepository.update(branch.id, data);
  }
}
