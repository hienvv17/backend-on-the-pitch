import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ResponseModule } from '../response/response.module';
import { SportFieldService } from './sport-field.service';
import { SportFieldController } from './sport-field.controller';
import { FirebaseAdmin } from '../firebase/firebase.service';
import { BranchEntity } from '../entities/branch.entity';
import { SportFieldEntity } from '../entities/sport-field.entity';
import { TimeSlotEntity } from '../entities/time-slot.entity';
import { SportCategoryEntity } from '../entities/sport-category.entity';
import { StaffModule } from 'src/staff/staff.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      SportFieldEntity,
      BranchEntity,
      SportCategoryEntity,
      TimeSlotEntity,
    ]),
    ResponseModule,
    StaffModule,
  ],
  controllers: [SportFieldController],
  providers: [SportFieldService, FirebaseAdmin],
  exports: [SportFieldService],
})
export class SportFieldModule {}
