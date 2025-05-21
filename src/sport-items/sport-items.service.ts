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
import { Orders } from 'src/entities/order.entity';
import { OrderDetail } from 'src/entities/order-detail.entity';

@Injectable()
export class SportItemsService {
  constructor(
    @InjectRepository(SportItemsEntity)
    private readonly sportItemRepo: Repository<SportItemsEntity>,
    @InjectRepository(SportItemBranchEntity)
    private readonly sportItemBranchRepo: Repository<SportItemBranchEntity>,
    @InjectRepository(ItemImportHistory)
    private readonly itemImportHistoryRepo: Repository<ItemImportHistory>,
    @InjectRepository(Orders)
    private readonly orderRepo: Repository<Orders>,
    @InjectRepository(OrderDetail)
    private readonly orderDetailRepo: Repository<OrderDetail>,
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
      .andWhere('sportItem.isActive = :isActive', { isActive: true });
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

  async getImportHistory(
    limit: number,
    offset: number,
    order: string,
    sortKey?: string,
    search?: string,
  ) {
    const query = this.itemImportHistoryRepo
      .createQueryBuilder('importHistory')
      .leftJoin('branches', 'branch', 'branch.id = importHistory.branchId')
      .leftJoin(
        'sport_items',
        'sportItem',
        'sportItem.id = importHistory.sportItemId',
      )
      .select([
        'importHistory.id "id"',
        'importHistory.branchId "branchId"',
        'importHistory.sportItemId "sportItemId"',
        'importHistory.quantity "quantity"',
        'importHistory.note "note"',
        'importHistory.createdAt "createdAt"',
        'importHistory.createdBy "createdBy"',
        'branch.name "branchName"',
        'sportItem.name "sportItemName"',
      ]);

    if (search) {
      query.andWhere(
        'LOWER(branch.name) LIKE :search OR LOWER(sportItem.name) LIKE :search',
        {
          search: `%${search.toLowerCase()}%`,
        },
      );
    }
    const sortBy = sortKey ? sortKey : 'importHistory.id';
    query.orderBy(sortBy, order ? 'ASC' : 'DESC');

    const [items, count] = await Promise.all([
      query.limit(limit).offset(offset).getRawMany(),
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

  async getItemToSold(
    limit: number,
    offset: number,
    order: string,
    branchId?: number,
    sortKey?: string,
    search?: string,
  ) {
    // prevent calling this function if branchId is not provided
    if (!branchId) {
      return { items: [], count: 0 };
    }

    const query = this.sportItemBranchRepo
      .createQueryBuilder('itemBranch')
      .leftJoin(
        'sport_items',
        'sportItem',
        'sportItem.id = itemBranch.sportItemId',
      )
      .where('itemBranch.quantity > 0')
      .andWhere('itemBranch.branchId = :branchId', { branchId })
      .select([
        'itemBranch.id "id"',
        'itemBranch.sportItemId "sportItemId"',
        'itemBranch.branchId "branchId"',
        'itemBranch.quantity "quantity"',
        'sportItem.name "sportItemName"',
        'sportItem.images "images"',
        'sportItem.price "price"',
      ]);

    if (search) {
      query.andWhere('LOWER(sportItem.name) LIKE :search', {
        search: `%${search.toLowerCase()}%`,
      });
    }
    const sortBy = sortKey ? sortKey : 'itemBranch.id';
    query.orderBy(sortBy, order ? 'ASC' : 'DESC');

    const [items, count] = await Promise.all([
      query.limit(limit).offset(offset).getRawMany(),
      query.getCount(),
    ]);

    return { items, count };
  }
  // create order, and update item branch quantity
  //  const data = bill.map((item) => ({
  //           sportItemId: item.sportItemId,
  //           branchId: item.branchId,
  //           quantityChoosen: item.quantityChoosen,
  //       }));

  async orderCreate(
    req: any,
    data: {
      sportItemId: number;
      branchId: number;
      quantityChoosen: number;
      price: number;
    }[],
  ) {
    //update item branch with array of data
    const newOrder = this.orderRepo.create({
      branchId: data[0].branchId,
      totalPrice: data.reduce(
        (acc, item) => acc + item.quantityChoosen * item.price,
        0,
      ),
      createdBy: req.staff.email,
    });
    await this.orderRepo.save(newOrder);
    return await Promise.all(
      data.map(async (item) => {
        const itemBranch = await this.sportItemBranchRepo.findOne({
          where: {
            sportItemId: item.sportItemId,
            branchId: item.branchId,
          },
        });
        if (!itemBranch) {
          throw new NotFoundException('Sport item not found');
        }

        const newQuantity = itemBranch.quantity - item.quantityChoosen;
        await this.sportItemBranchRepo.update(itemBranch.id, {
          quantity: newQuantity,
          lastModifiedBy: req.staff.email,
        });
        // insert into order-detail
        await this.orderDetailRepo.save({
          orderId: newOrder.id,
          sportItemId: item.sportItemId,
          quantity: item.quantityChoosen,
          price: item.price,
          total: item.quantityChoosen * item.price,
        });
      }),
    );
  }
}
