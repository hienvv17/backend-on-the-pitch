import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import configuration from './config/configuration';
import { StaffsModule } from './staffs/staffs.module';
import { BranchesModule } from './branches/branches.module';
import { SportCategoriesModule } from './sport-categories/sport-categories.module';
import { SportFieldsModule } from './sport-fields/sport-fields.module';
import { FieldBookingsModule } from './field-bookings/field-bookings.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      load: [configuration],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) =>
        configService.get('defaultConnection'),
      inject: [ConfigService],
    }),
    AuthModule,
    UsersModule,
    StaffsModule,
    BranchesModule,
    SportCategoriesModule,
    SportFieldsModule,
    FieldBookingsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
