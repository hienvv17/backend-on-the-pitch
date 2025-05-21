import { Controller, Get, Post, Body } from '@nestjs/common';
import { OrderService } from './order.service';
import { Orders } from '../entities/order.entity';
import { ItemImportHistory } from '../entities/item-import-history.entity';
// import { Orders } from './order.entity';
// import { ItemImportHistory } from './item-import-history.entity';

@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Get()
  getOrders(): Promise<Orders[]> {
    return this.orderService.findAll();
  }

  @Post()
  createOrder(@Body() orderData: Partial<Orders>): Promise<Orders> {
    return this.orderService.createOrder(orderData);
  }

  @Post('import-history')
  createImportHistory(
    @Body() importData: Partial<ItemImportHistory>,
  ): Promise<ItemImportHistory> {
    return this.orderService.addImportHistory(importData);
  }
}
