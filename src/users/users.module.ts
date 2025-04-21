import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UserController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersEntity } from '../entities/users.entity';
import { ResponseModule } from '../response/response.module';
import { FirebaseAdmin } from '../firebase/firebase.service';

@Module({
  imports: [TypeOrmModule.forFeature([UsersEntity]), ResponseModule],
  controllers: [UserController],
  providers: [UsersService, FirebaseAdmin],
  exports: [UsersService],
})
export class UsersModule {}
