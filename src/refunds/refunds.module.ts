import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RefundsService } from './refunds.service';
import { RefundsController } from './refunds.controller';
import { RefundsEntity } from '../entities/refund.entity';
import { FieldBookingsEntity } from '../entities/field-bookings.entity';
import { ResponseModule } from '../response/response.module';
import { StaffsModule } from '../staffs/staffs.module';
import { FirebaseAdmin } from '../firebase/firebase.service';
import { UsersEntity } from '../entities/users.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([RefundsEntity, FieldBookingsEntity, UsersEntity]),
    ResponseModule,
    StaffsModule,
  ],
  controllers: [RefundsController],
  providers: [RefundsService, FirebaseAdmin],
  exports: [RefundsService],
})
export class RefundsModule {}
