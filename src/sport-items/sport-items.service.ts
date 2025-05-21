import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SportItemsEntity } from '../entities/sport-items.entity';
import { Repository } from 'typeorm';
import { CreateSportItemDto } from './dto/create-sport-item.dto';
import { UpdateSportItemDto } from './dto/update-sport-item.dto';
import { ImportItemDto } from './dto/import-item.dto';
import { SportItemBranchEntity } from '../entities/sport-item-branch.entity';
import { ItemImportHistory } from '../entities/item-import-history.entity';

@Injectable()
export class SportItemsService {
  constructor(
    @InjectRepository(SportItemsEntity)
    private readonly sportItemRepo: Repository<SportItemsEntity>,
    @InjectRepository(SportItemBranchEntity)
    private readonly sportItemBranchRepo: Repository<SportItemBranchEntity>,
    @InjectRepository(ItemImportHistory)
    private readonly itemImportHistoryRepo: Repository<ItemImportHistory>,
  ) {}

  async create(dto: CreateSportItemDto) {
    const newItem = this.sportItemRepo.create(dto);
    return this.sportItemRepo.save(newItem);
  }

  async findAll(
    limit: number,
    offset: number,
    order: string,
    sortKey?: string,
    search?: string,
  ) {
    const query = this.sportItemRepo
      .createQueryBuilder('sportItem')
      .where('sportItem.isDelete = :isDelete', { isDelete: false });
    if (search) {
      query.andWhere('LOWER(sportItem.name) LIKE :search', {
        search: `%${search.toLowerCase()}%`,
      });
    }
    const sortBy = sortKey ? sortKey : 'sportItem.id';
    query.orderBy(sortBy, order ? 'ASC' : 'DESC');

    const [items, count] = await Promise.all([
      query.skip(offset).take(limit).getMany(),
      query.getCount(),
    ]);

    return { items, count };
  }

  async findAllToImport(
    limit: number,
    offset: number,
    order: string,
    sortKey?: string,
    search?: string,
  ) {
    const query = this.sportItemRepo
      .createQueryBuilder('sportItem')
      .where('sportItem.isDelete = :isDelete', { isDelete: false })
      .andWhere('sportItem.isImport = :isActive', { isActive: true });
    if (search) {
      query.andWhere('LOWER(sportItem.name) LIKE :search', {
        search: `%${search.toLowerCase()}%`,
      });
    }
    const sortBy = sortKey ? sortKey : 'sportItem.id';
    query.orderBy(sortBy, order ? 'ASC' : 'DESC');

    const [items, count] = await Promise.all([
      query.skip(offset).take(limit).getMany(),
      query.getCount(),
    ]);

    return { items, count };
  }

  async findOne(id: number) {
    const item = await this.sportItemRepo.findOne({
      where: { id: id, isDelete: false },
    });
    if (!item) throw new NotFoundException('Sport item not found');
    return item;
  }

  async update(id: number, dto: UpdateSportItemDto) {
    await this.findOne(id); // will throw if not found
    await this.sportItemRepo.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: number) {
    const item = await this.findOne(id);
    if (!item) throw new BadRequestException('Sport item not exist');
    return this.sportItemRepo.update(id, {
      isDelete: true,
      updatedAt: new Date(),
    });
  }

  async importItem(req: any, dto: ImportItemDto) {
    // Check if the item exists
    const itemBranch = await this.sportItemBranchRepo.findOne({
      where: {
        sportItemId: dto.sportItemId,
        branchId: dto.branchId,
      },
    });
    if (!itemBranch) {
      //create new item branch
      const newItemBranch = this.sportItemBranchRepo.create({
        sportItemId: dto.sportItemId,
        branchId: dto.branchId,
        quantity: dto.quantity,
        lastModifiedBy: req.staff.email,
      });
      await this.sportItemBranchRepo.save(newItemBranch);
    } else {
      //update item branch
      const newQuantity = itemBranch.quantity + dto.quantity;
      await this.sportItemBranchRepo.update(itemBranch.id, {
        quantity: newQuantity,
        lastModifiedBy: req.staff.email,
      });
    }

    // add new record to item import history for tracking
    const history = this.itemImportHistoryRepo.create({
      branchId: dto.branchId,
      sportItemId: dto.sportItemId,
      quantity: dto.quantity,
      createdBy: req.staff.email,
    });
    await this.itemImportHistoryRepo.save(history);
    return;
  }
}
