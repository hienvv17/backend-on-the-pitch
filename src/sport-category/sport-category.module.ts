import { Module, Res } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SportCategoryService } from './sport-category.service';
import { SportCategoryEntity } from '../entities/sport-category.entity';
import { SportCategoryController } from './sport-category.controller';
import { FirebaseAdmin } from '../firebase/firebase.service';
import { ResponseModule } from '../response/response.module';
import { StaffModule } from 'src/staff/staff.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([SportCategoryEntity]),
    ResponseModule,
    StaffModule,
  ],
  controllers: [SportCategoryController],
  providers: [SportCategoryService, FirebaseAdmin],
  exports: [SportCategoryService],
})
export class SportCategoryModule {}
