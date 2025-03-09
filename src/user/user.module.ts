import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '@src/entities/user.entity';
import { ResponseModule } from '@src/response/response.module';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity]), ResponseModule],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
