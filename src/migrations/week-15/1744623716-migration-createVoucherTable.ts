import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateVouchersTable1714116000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE "voucher_type_enum" AS ENUM ('ORDER', 'BOOKING');
      CREATE TYPE "voucher_status_enum" AS ENUM ('ACTIVE', 'INACTIVE', 'EXPIRED', 'USED');
      
      CREATE TABLE "vouchers" (
        "id" BIGSERIAL PRIMARY KEY,
        "code" VARCHAR(100) UNIQUE NOT NULL,
        "type" "voucher_type_enum" NOT NULL,
        "status" "voucher_status_enum" NOT NULL DEFAULT 'ACTIVE',
        "discount_amount" BIGINT NOT NULL,
        "expire_date" DATE NOT NULL,
        "user_id" BIGINT,
        "created_at" TIMESTAMP DEFAULT now(),
        "updated_at" TIMESTAMP DEFAULT now(),
        CONSTRAINT "FK_voucher_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE
      );
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP TABLE "vouchers";
      DROP TYPE "voucher_type_enum";
      DROP TYPE "voucher_status_enum";
    `);
  }
}
