import { registerAs } from '@nestjs/config';
import { DataSource, DataSourceOptions } from 'typeorm';
import { config as envConfig } from 'dotenv';

envConfig();

export const config = {
  type: 'postgres',
  url: process.env.DATABASE_URL || '',
  synchronize: false, // Set to false in production environments
  logging: true, // Enable logging if needed,
  autoLoadEntities: true,
  entities: ['src/**/*.entity{.ts,.js}'],
  migrations: ['migrations/*{.ts,.js}'],
};

export default registerAs('typeorm', () => config);
export const connectionSource = new DataSource(config as DataSourceOptions);
