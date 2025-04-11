import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ResponseModule } from '../response/response.module';
import { SportFieldService } from './sport-fields.service';
import { SportFieldsController } from './sport-fields.controller';
import { FirebaseAdmin } from '../firebase/firebase.service';
import { BranchEntity } from '../entities/branch.entity';
import { SportFieldEntity } from '../entities/sport-field.entity';
import { TimeSlotEntity } from '../entities/time-slot.entity';
import { SportCategoryEntity } from '../entities/sport-category.entity';
import { StaffsModule } from 'src/staffs/staffs.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      SportFieldEntity,
      BranchEntity,
      SportCategoryEntity,
      TimeSlotEntity,
    ]),
    ResponseModule,
    StaffsModule,
  ],
  controllers: [SportFieldsController],
  providers: [SportFieldService, FirebaseAdmin],
  exports: [SportFieldService],
})
export class SportFieldsModule {}
