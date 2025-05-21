import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SportItemsService } from './sport-items.service';
import { SportItemsController } from './sport-items.controller';
import { SportItemsEntity } from '../entities/sport-items.entity';
import { FirebaseAdmin } from '../firebase/firebase.service';
import { StaffsModule } from '../staffs/staffs.module';
import { ResponseModule } from '../response/response.module';
import { SportItemBranchEntity } from '../entities/sport-item-branch.entity';
import { ItemImportHistory } from '../entities/item-import-history.entity';
import { Orders } from 'src/entities/order.entity';
import { OrderDetail } from 'src/entities/order-detail.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      SportItemsEntity,
      SportItemBranchEntity,
      ItemImportHistory,
      Orders,
      OrderDetail,
    ]),
    StaffsModule,
    ResponseModule,
  ],
  controllers: [SportItemsController],
  providers: [SportItemsService, FirebaseAdmin],
  exports: [SportItemsService],
})
export class SportItemsModule {}
