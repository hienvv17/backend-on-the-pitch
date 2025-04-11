import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UserController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '../entities/user.entity';
import { ResponseModule } from '../response/response.module';
import { FirebaseAdmin } from 'src/firebase/firebase.service';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity]), ResponseModule],
  controllers: [UserController],
  providers: [UsersService, FirebaseAdmin],
  exports: [UsersService],
})
export class UsersModule {}
