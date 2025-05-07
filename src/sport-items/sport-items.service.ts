import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SportItemsEntity } from '../entities/sport-items.entity';
import { Repository } from 'typeorm';
import { CreateSportItemDto } from './dto/create-sport-item.dto';

@Injectable()
export class SportItemsService {
  constructor(
    @InjectRepository(SportItemsEntity)
    private readonly sportItemRepo: Repository<SportItemsEntity>,
  ) {}

  async create(dto: CreateSportItemDto) {
    const newItem = this.sportItemRepo.create(dto);
    return this.sportItemRepo.save(newItem);
  }

  async findAll() {
    return this.sportItemRepo.findAndCount({ where: { isDelete: false } });
  }

  async findOne(id: number) {
    const item = await this.sportItemRepo.findOne({
      where: { id: id, isDelete: false },
    });
    if (!item) throw new NotFoundException('Sport item not found');
    return item;
  }

  //   async update(id: number, dto: UpdateSportItemDto) {
  //     await this.findOne(id); // will throw if not found
  //     await this.sportItemRepo.update(id, dto);
  //     return this.findOne(id);
  //   }

  async remove(id: number) {
    const item = await this.findOne(id);
    if (!item) throw new BadRequestException('Sport item not exist');
    return this.sportItemRepo.update(id, {
      isDelete: true,
      updatedAt: new Date(),
    });
  }
}
