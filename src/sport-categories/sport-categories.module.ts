import { Module, Res } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SportCategoriesService } from './sport-categories.service';
import { SportCategoryEntity } from '../entities/sport-category.entity';
import { SportCategoriesController } from './sport-categories.controller';
import { FirebaseAdmin } from '../firebase/firebase.service';
import { ResponseModule } from '../response/response.module';
import { StaffsModule } from 'src/staffs/staffs.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([SportCategoryEntity]),
    ResponseModule,
    StaffsModule,
  ],
  controllers: [SportCategoriesController],
  providers: [SportCategoriesService, FirebaseAdmin],
  exports: [SportCategoriesService],
})
export class SportCategoriesModule {}
