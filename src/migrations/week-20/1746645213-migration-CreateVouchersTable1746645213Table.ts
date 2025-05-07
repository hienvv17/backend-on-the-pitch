import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateVouchersTable1746645213000000 implements MigrationInterface {
  name = 'CreateVouchersTable1746645213000000'; // Replace 'xxxx' with a timestamp if necessary

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE voucher_type AS ENUM ('BIRTHDAY', 'LOYALTY', 'REVIEW', 'MANUAL');
      CREATE TYPE voucher_status AS ENUM ('ACTIVE', 'EXPIRED', 'USED');

      CREATE TABLE vouchers (
        id SERIAL PRIMARY KEY,
        type voucher_type NOT NULL,
        code VARCHAR NOT NULL,
        max_discount_amount INT NOT NULL,
        percent_discount INT NOT NULL,
        valid_from DATE,
        valid_to DATE,
        status voucher_status NOT NULL DEFAULT 'ACTIVE',
        user_id BIGINT,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        
        CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
      );
    `);

    await queryRunner.query(`
      
      CREATE TABLE voucher_config (
        id SERIAL PRIMARY KEY,
        type voucher_type NOT NULL UNIQUE,
        voucher_code VARCHAR(10) NOT NULL UNIQUE,
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        percent_discount INT NOT NULL,
        max_discount_amount INT NOT NULL,
        valid_days INT NOT NULL,
        amount_to_trigger INT
      );
    `);

    await queryRunner.query(`
      ALTER TABLE "field_bookings"
      ADD "origin_price" INT NOT NULL DEFAULT 0,  -- Original price before any discounts (default 0)
      ADD "discount_amount" INT NULL,            -- Discount amount applied (nullable)
      ADD "voucher_code" VARCHAR(20) NULL;      -- Voucher code applied (nullable)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP TABLE vouchers;
      DROP TYPE voucher_type;
      DROP TYPE voucher_status;
    `);

    await queryRunner.query(`
      DROP TABLE voucher_config;
    `);

    await queryRunner.query(`
      ALTER TABLE "field-bookings"
      DROP COLUMN "origin_price",
      DROP COLUMN "discount_amount",
      DROP COLUMN "voucher_code";
    `);
  }
}
