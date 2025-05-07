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
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { join } from 'path';
import { SportItemsModule } from './sport-items/sport-items.module';
import { ReviewsModule } from './reviews/review.module';
import { RefundsModule } from './refunds/refunds.module';
import { UploadModule } from './upload/upload.module';

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
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        transport: {
          host: configService.get<string>('MAILER_HOST'),
          port: +configService.get<number>('MAILER_PORT'),
          ignoreTLS:
            configService.get<string>('MAILER_IGNORE_TLS') === 'true'
              ? true
              : false,
          secure:
            configService.get<string>('MAILER_SECURE') === 'true'
              ? true
              : false,
          auth: {
            user: configService.get<string>('MAILER_USER'),
            pass: configService.get<string>('MAILER_PASSWORD'),
          },
        },
        defaults: {
          from: configService.get<string>('MAILER_FROM'),
        },
        template: {
          dir: join(__dirname, '..', 'templates'),
          adapter: new HandlebarsAdapter(),
          options: {
            strict: true,
          },
        },
      }),
    }),
    //to do update the path later

    AuthModule,
    UsersModule,
    StaffsModule,
    BranchesModule,
    SportCategoriesModule,
    SportFieldsModule,
    FieldBookingsModule,
    SportItemsModule,
    ReviewsModule,
    RefundsModule,
    UploadModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
