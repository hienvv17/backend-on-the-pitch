import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SportCategoriesEntity } from '../entities/sport-categories.entity';
import { Repository } from 'typeorm';
import { CreateSportCategoryDto } from './dto/create-sport-category.dto';
import { UpdateSportCategoryDto } from './dto/update-sport-category.dto';

@Injectable()
export class SportCategoriesService {
  constructor(
    @InjectRepository(SportCategoriesEntity)
    private readonly sportCategoryRepo: Repository<SportCategoriesEntity>,
  ) {}

  async create(dto: CreateSportCategoryDto): Promise<SportCategoriesEntity> {
    const category = this.sportCategoryRepo.create(dto);
    return this.sportCategoryRepo.save(category);
  }

  async getAll(): Promise<SportCategoriesEntity[]> {
    return this.sportCategoryRepo.find({
      where: { isActive: true },
      order: {
        id: 'ASC',
      },
    });
  }

  async getManageAll(): Promise<SportCategoriesEntity[]> {
    return this.sportCategoryRepo.find({
      order: {
        id: 'ASC',
      },
    });
  }

  async findOne(id: number): Promise<SportCategoriesEntity> {
    const category = await this.sportCategoryRepo.findOne({
      where: { id },
    });
    if (!category)
      throw new NotFoundException(`Sport category with id ${id} not found`);
    return category;
  }

  async update(
    id: number,
    dto: UpdateSportCategoryDto,
  ): Promise<SportCategoriesEntity> {
    const category = await this.findOne(id);
    Object.assign(category, dto);
    return this.sportCategoryRepo.save({ ...category, updatedAt: new Date() });
  }

  async delete(id: number): Promise<void> {
    const result = await this.sportCategoryRepo.delete(id);
    if (result.affected === 0)
      throw new NotFoundException(`Sport category with id ${id} not found`);
  }
}
