import { Module, Res } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SportCategoriesService } from './sport-categories.service';
import { SportCategoriesEntity } from '../entities/sport-categories.entity';
import { SportCategoriesController } from './sport-categories.controller';
import { FirebaseAdmin } from '../firebase/firebase.service';
import { ResponseModule } from '../response/response.module';
import { StaffsModule } from '../staffs/staffs.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([SportCategoriesEntity]),
    ResponseModule,
    StaffsModule,
  ],
  controllers: [SportCategoriesController],
  providers: [SportCategoriesService, FirebaseAdmin],
  exports: [SportCategoriesService],
})
export class SportCategoriesModule {}
