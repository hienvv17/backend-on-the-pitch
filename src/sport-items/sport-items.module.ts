import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SportItemsService } from './sport-items.service';
import { SportItemsController } from './sport-items.controller';
import { SportItemsEntity } from '../entities/sport-items.entity';
import { FirebaseAdmin } from 'src/firebase/firebase.service';
import { StaffsModule } from 'src/staffs/staffs.module';
import { ResponseModule } from 'src/response/response.module';

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
