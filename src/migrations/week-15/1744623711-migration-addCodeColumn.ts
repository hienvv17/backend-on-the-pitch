import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCodeColumnToBooking1744623761000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE field_bookings 
        ADD COLUMN code VARCHAR(12) NOT NULL
      `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE field_bookings 
      DROP COLUMN code
    `);
  }
}
