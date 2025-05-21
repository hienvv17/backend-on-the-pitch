import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ItemImportHistory } from '../entities/item-import-history.entity';
import { OrderDetail } from '../entities/order-detail.entity';
import { Orders } from '../entities/order.entity';
import { Repository } from 'typeorm';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Orders)
    private ordersRepo: Repository<Orders>,

    @InjectRepository(OrderDetail)
    private orderDetailsRepo: Repository<OrderDetail>,

    @InjectRepository(ItemImportHistory)
    private importHistoryRepo: Repository<ItemImportHistory>,
  ) {}

  // Example: create order with details
  async createOrder(orderData: Partial<Orders>): Promise<Orders> {
    // orderData.orderDetails must be present with details

    const order = this.ordersRepo.create(orderData);
    return this.ordersRepo.save(order);
  }

  // Example: get all orders
  async findAll(): Promise<Orders[]> {
    return this.ordersRepo.find({
      relations: ['branch', 'user', 'orderDetails', 'orderDetails.sportItem'],
    });
  }

  // Example: create import history record
  async addImportHistory(data: Partial<ItemImportHistory>) {
    const importRecord = this.importHistoryRepo.create(data);
    return this.importHistoryRepo.save(importRecord);
  }
}
