import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReviewsEntity } from '../entities/reviews.entity';
import { ReviewsService } from './reviews.service';
import { ReviewsController } from './reviews.controller';
import { FirebaseAdmin } from '../firebase/firebase.service';
import { ResponseModule } from '../response/response.module';
import { UsersEntity } from '../entities/users.entity';
import { FieldBookingsEntity } from '../entities/field-bookings.entity';
import { StaffsModule } from '../staffs/staffs.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ReviewsEntity, UsersEntity, FieldBookingsEntity]),
    ResponseModule,
    StaffsModule,
  ],
  controllers: [ReviewsController],
  providers: [ReviewsService, FirebaseAdmin],
  exports: [ReviewsService],
})
export class ReviewsModule {}
