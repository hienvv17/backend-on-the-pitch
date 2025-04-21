import { MigrationInterface, QueryRunner } from 'typeorm';

export class RenameTable1744427613000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user" RENAME TO "users"`);
    await queryRunner.query(`ALTER TABLE "branch" RENAME TO "branches"`);
    await queryRunner.query(
      `ALTER TABLE "sport_category" RENAME TO "sport_categories"`,
    );
    await queryRunner.query(
      `ALTER TABLE "sport_field" RENAME TO "sport_fields"`,
    );
    await queryRunner.query(`ALTER TABLE "sport_item" RENAME TO "sport_items"`);
    await queryRunner.query(`ALTER TABLE "time_slot" RENAME TO "time_slots"`);
    await queryRunner.query(`ALTER TABLE "staff" RENAME TO "staffs"`);
    await queryRunner.query(
      `ALTER TABLE "field_booking" RENAME TO "field_bookings"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" RENAME TO "user"`);
    await queryRunner.query(`ALTER TABLE "branches" RENAME TO "branch"`);
    await queryRunner.query(
      `ALTER TABLE "sport_categories" RENAME TO "sport_category"`,
    );
    await queryRunner.query(
      `ALTER TABLE "sport_fields" RENAME TO "sport_field"`,
    );
    await queryRunner.query(`ALTER TABLE "sport_items" RENAME TO "sport_item"`);
    await queryRunner.query(`ALTER TABLE "time_slots" RENAME TO "time_slot"`);
    await queryRunner.query(`ALTER TABLE "staffs" RENAME TO "staff"`);
    await queryRunner.query(
      `ALTER TABLE "field_bookings" RENAME TO "field_booking"`,
    );
  }
}
