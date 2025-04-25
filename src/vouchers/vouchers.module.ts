import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VouchersService } from './vouchers.service';
import { VouchersController } from './vouchers.controller';
import { VouchersEntity } from '../entities/vouchers.entity';
import { FirebaseAdmin } from '../firebase/firebase.service';
import { StaffsModule } from '../staffs/staffs.module';


@Module({
    imports: [TypeOrmModule.forFeature([VouchersEntity]), StaffsModule],
    controllers: [VouchersController],
    providers: [VouchersService, FirebaseAdmin],
    exports: [VouchersService],
})
export class VouchersModule { }
