import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import { UsersEntity } from '../entities/users.entity';
import { FieldBookingsEntity } from '../entities/field-bookings.entity';
import { StaffsModule } from '../staffs/staffs.module';
import { FirebaseAdmin } from '../firebase/firebase.service';
import { ResponseModule } from '../response/response.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([UsersEntity, FieldBookingsEntity]),
    StaffsModule,
    ResponseModule,
  ],
  controllers: [DashboardController],
  providers: [DashboardService, FirebaseAdmin],
})
export class DashboardModule {}
