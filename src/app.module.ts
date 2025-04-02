import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import configuration from './config/configuration';
import { StaffModule } from './staff/staff.module';
import { BranchModule } from './branch/brach.module';
import { SportCategoryModule } from './sport-category/sport-category.module';
import { SportFieldModule } from './sport-field/sport-fields.module';

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
    UserModule,
    StaffModule,
    BranchModule,
    SportCategoryModule,
    SportFieldModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
