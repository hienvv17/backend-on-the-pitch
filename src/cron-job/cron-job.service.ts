import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';

@Injectable()
export class CronJobService {
  // Cron job that runs every day at 3 AM
  @Cron('0 3 * * *')
  handleDailyCron() {
    console.log('Running daily cron job at 3 AM');
    // Your logic for the daily cron job here
  }

  // Cron job that runs on the first day of every month at 4 PM
  @Cron('0 16 1 * *')
  handleMonthlyCron() {
    console.log('Running monthly cron job on the 1st day at 4 PM');
    // Your logic for the monthly cron job here
  }
}
