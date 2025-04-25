import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SportItemsService } from './sport-items.service';
import { SportItemsController } from './sport-items.controller';
import { SportItemsEntity } from '../entities/sport-items.entity';
import { FirebaseAdmin } from '../firebase/firebase.service';
import { StaffsModule } from '../staffs/staffs.module';
import { ResponseModule } from '../response/response.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([SportItemsEntity]),
    StaffsModule,
    ResponseModule,
  ],
  controllers: [SportItemsController],
  providers: [SportItemsService, FirebaseAdmin],
  exports: [SportItemsService],
})
export class SportItemsModule {}
