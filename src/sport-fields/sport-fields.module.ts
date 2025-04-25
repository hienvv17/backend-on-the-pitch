import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ResponseModule } from '../response/response.module';
import { SportFieldService } from './sport-fields.service';
import { SportFieldsController } from './sport-fields.controller';
import { FirebaseAdmin } from '../firebase/firebase.service';
import { BranchsEntity } from '../entities/branches.entity';
import { SportFieldsEntity } from '../entities/sport-fields.entity';
import { TimeSlotsEntity } from '../entities/time-slots.entity';
import { SportCategoriesEntity } from '../entities/sport-categories.entity';
import { StaffsModule } from '../staffs/staffs.module';
import { FieldBookingsEntity } from '../entities/field-bookings.entity';
import { CacheModule } from '../cache/cache.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      SportFieldsEntity,
      BranchsEntity,
      SportCategoriesEntity,
      TimeSlotsEntity,
      FieldBookingsEntity,
    ]),
    ResponseModule,
    StaffsModule,
    CacheModule,
  ],
  controllers: [SportFieldsController],
  providers: [SportFieldService, FirebaseAdmin],
  exports: [SportFieldService],
})
export class SportFieldsModule {}
