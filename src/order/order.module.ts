import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ItemImportHistory } from '../entities/item-import-history.entity';
import { OrderDetail } from '../entities/order-detail.entity';
import { Orders } from '../entities/order.entity';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { ResponseModule } from '../response/response.module';
import { StaffsModule } from '../staffs/staffs.module';
import { FirebaseAdmin } from '../firebase/firebase.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Orders, OrderDetail, ItemImportHistory]),
    ResponseModule,
    StaffsModule,
  ],
  providers: [OrderService, FirebaseAdmin],
  controllers: [OrderController],
  exports: [OrderService],
})
export class OrderModule {}
