import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ResponseModule } from '../response/response.module';
import { SportFieldService } from './sport-field.service';
import { SportFieldController } from './sport-field.controller';
import { FirebaseAdmin } from '../firebase/firebase.service';
import { BranchEntity } from '../entities/branch.entity';
import { SportFieldEntity } from '../entities/sport-field.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      SportFieldEntity,
      BranchEntity,
      SportFieldEntity,
    ]),
    ResponseModule,
  ],
  controllers: [SportFieldController],
  providers: [SportFieldService, FirebaseAdmin],
  exports: [SportFieldService],
})
export class SportFieldModule {}
