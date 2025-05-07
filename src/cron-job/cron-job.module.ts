import { Module } from '@nestjs/common';
import { CronJobService } from './cron-job.service';

@Module({
  providers: [CronJobService], // Add your cron job service
})
export class CronJobModule {}
