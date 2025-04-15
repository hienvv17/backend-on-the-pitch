import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ResponseModule } from '../response/response.module';
import { SportFieldService } from './sport-fields.service';
import { SportFieldsController } from './sport-fields.controller';
import { FirebaseAdmin } from '../firebase/firebase.service';
import { BranchsEntity } from '../entities/branchs.entity';
import { SportFieldsEntity } from '../entities/sport-fields.entity';
import { TimeSlotsEntity } from '../entities/time-slots.entity';
import { SportCategoriesEntity } from '../entities/sport-categories.entity';
import { StaffsModule } from '../staffs/staffs.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      SportFieldsEntity,
      BranchsEntity,
      SportCategoriesEntity,
      TimeSlotsEntity,
    ]),
    ResponseModule,
    StaffsModule,
  ],
  controllers: [SportFieldsController],
  providers: [SportFieldService, FirebaseAdmin],
  exports: [SportFieldService],
})
export class SportFieldsModule {}
