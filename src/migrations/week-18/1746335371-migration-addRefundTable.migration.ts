import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateFieldBookingsAndRefunds1746335371000000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE refund_status AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'COMPLETED');
      CREATE TABLE refunds (
        id SERIAL PRIMARY KEY,
        field_booking_id BIGINT NOT NULL,
        user_id BIGINT NOT NULL,
        amount INT NOT NULL,
        status refund_status DEFAULT 'PENDING',
        reason TEXT,
        admin_note TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (field_booking_id) REFERENCES field_bookings(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS refunds;`);
  }
}
