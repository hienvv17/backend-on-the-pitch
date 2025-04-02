import { Injectable, BadRequestException } from '@nestjs/common';
import { BranchEntity } from '../entities/branch.entity';
import { Repository } from 'typeorm';
import { CreateBranchDto } from './dto/create-branch.dto';
import { UpdateBranchDto } from './dto/update-branch.dto';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class BranchService {
  constructor(
    @InjectRepository(BranchEntity)
    private branchRepo: Repository<BranchEntity>,
  ) {}

  async getAll(): Promise<BranchEntity[]> {
    //to do: get other info for the and how many field have
    return this.branchRepo.find();
  }

  async getOne(id: number): Promise<BranchEntity> {
    const branch = await this.branchRepo.findOne({ where: { id } });
    if (!branch) throw new BadRequestException('Branch do not exist');
    return branch;
  }

  async create(dto: CreateBranchDto) {
    return await this.branchRepo.save(dto);
  }

  async update(id: number, dto: UpdateBranchDto) {
    const branch = await this.branchRepo.findOne({ where: { id } });
    if (!branch) throw new BadRequestException('Branch do not exist');
    return await this.branchRepo.update(id, dto);
  }

  async delete(id: number) {
    const branch = await this.branchRepo.findOne({ where: { id } });
    if (!branch) throw new BadRequestException('Branch do not exist');
    return await this.branchRepo.delete(id);
  }
}
