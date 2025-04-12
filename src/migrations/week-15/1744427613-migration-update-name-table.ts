import { MigrationInterface, QueryRunner } from 'typeorm';

export class RenameTable1744427613 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user" RENAME TO "users"`);
    await queryRunner.query(`ALTER TABLE "branch" RENAME TO "branchs"`);
    await queryRunner.query(
      `ALTER TABLE "sport-category" RENAME TO "sport-categories"`,
    );
    await queryRunner.query(
      `ALTER TABLE "sport-field" RENAME TO "sport-fields"`,
    );
    await queryRunner.query(`ALTER TABLE "sport-item" RENAME TO "sport-items"`);
    await queryRunner.query(`ALTER TABLE "time-slot" RENAME TO "time-slots"`);
    await queryRunner.query(`ALTER TABLE "staff" RENAME TO "staffs"`);
    await queryRunner.query(
      `ALTER TABLE "field_booking" RENAME TO "field-bookings"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" RENAME TO "user"`);
    await queryRunner.query(`ALTER TABLE "branchs" RENAME TO "branch"`);
    await queryRunner.query(
      `ALTER TABLE "sport-categories" RENAME TO "sport-category"`,
    );
    await queryRunner.query(
      `ALTER TABLE "sport-fields" RENAME TO "sport-field"`,
    );
    await queryRunner.query(`ALTER TABLE "sport-items" RENAME TO "sport-item"`);
    await queryRunner.query(`ALTER TABLE "time-slots" RENAME TO "time-slot"`);
    await queryRunner.query(`ALTER TABLE "staffs" RENAME TO "staff"`);
    await queryRunner.query(
      `ALTER TABLE "field-bookings" RENAME TO "field_booking"`,
    );
  }
}
