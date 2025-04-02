import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SportCategoryEntity } from '../entities/sport-category.entity';
import { Repository } from 'typeorm';
import { CreateSportCategoryDto } from './dto/create-sport-category.dto copy';
import { UpdateSportCategoryDto } from './dto/update-sport-category.dto';

@Injectable()
export class SportCategoryService {
  constructor(
    @InjectRepository(SportCategoryEntity)
    private readonly sportCategoryRepo: Repository<SportCategoryEntity>,
  ) {}

  async create(dto: CreateSportCategoryDto): Promise<SportCategoryEntity> {
    const category = this.sportCategoryRepo.create(dto);
    return this.sportCategoryRepo.save(category);
  }

  async getAll(): Promise<SportCategoryEntity[]> {
    return this.sportCategoryRepo.find();
  }

  async findOne(id: number): Promise<SportCategoryEntity> {
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
  ): Promise<SportCategoryEntity> {
    const category = await this.findOne(id);
    Object.assign(category, dto);
    return this.sportCategoryRepo.save(category);
  }

  async delete(id: number): Promise<void> {
    const result = await this.sportCategoryRepo.delete(id);
    if (result.affected === 0)
      throw new NotFoundException(`Sport category with id ${id} not found`);
  }
}
