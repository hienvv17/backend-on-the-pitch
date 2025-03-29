import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SportFieldEntity } from '../entities/sport-field.entity';
import { BranchEntity } from '../entities/branch.entity';
import { SportCategoryEntity } from '../entities/sport-category.entity';
import { CreateSportFieldDto } from './dtos/create-sport-field.dto';
import { UpdateSportFieldDto } from './dtos/update-sport-field.dto';
@Injectable()
export class SportFieldService {
  constructor(
    @InjectRepository(SportFieldEntity)
    private sportFieldRepo: Repository<SportFieldEntity>,
    @InjectRepository(BranchEntity)
    private branchRepo: Repository<BranchEntity>,
    @InjectRepository(SportCategoryEntity)
    private sportCategoryRepo: Repository<SportCategoryEntity>,
  ) {}

  async getAll(bracnhId: number) {
    return await this.sportFieldRepo.findAndCount({ where: { id: bracnhId } });
  }

  async create(dto: CreateSportFieldDto) {
    const { name, branchId, sportCategoryId, description, images, isActive } =
      dto;
    const branch = await this.branchRepo.findOne({ where: { id: branchId } });
    if (!branch) throw new BadRequestException('Brach do not exist');
    const sportCategory = await this.sportCategoryRepo.findOne({
      where: { id: sportCategoryId },
    });
    if (!sportCategory)
      throw new BadRequestException('Sport type do not exist');

    return await this.sportCategoryRepo.save(
      this.sportFieldRepo.create({
        name,
        branchId,
        sportCategoryId,
        description,
        images,
        isActive,
      }),
    );
  }

  async updateSportField(
    id: number,
    updateDto: UpdateSportFieldDto,
  ): Promise<SportFieldEntity> {
    const sportField = await this.sportCategoryRepo.findOne({
      where: { id },
    });

    if (!sportField) {
      throw new BadRequestException(`Sport field with ID ${id} not found`);
    }

    Object.assign(sportField, updateDto);
    return await this.sportFieldRepo.save(sportField);
  }

  async deleteSportField(id: number): Promise<any> {
    const sportField = await this.sportCategoryRepo.findOne({
      where: { id },
    });

    if (!sportField) {
      throw new BadRequestException(`Sport field with ID ${id} not found`);
    }

    return await this.sportFieldRepo.delete(id);
  }

  async getAvailable() {
    return {};
  }
}
