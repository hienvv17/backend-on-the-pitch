import { DataSource } from 'typeorm';
import { config } from 'dotenv';

switch (process.env.NODE_ENV) {
  case 'dev':
    config({ path: '.env.dev' });
    break;
  case 'uat':
    config({ path: '.env.uat' });
    break;
  case 'prod':
    config({ path: '.env.prod' });
    break;
  default:
    config();
}

export const defaultConnection = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL || '',
  migrations: ['src/migrations/**/*.ts'],
  entities: ['src/entities/*.ts'],
  synchronize: false, // Set to false in production environments
  logging: true, // Enable logging if needed,
});
