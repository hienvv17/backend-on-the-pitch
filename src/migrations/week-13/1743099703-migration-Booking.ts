import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTimeSlotTable1711650000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        CREATE TABLE sport_field (
          id SERIAL PRIMARY KEY,
          name VARCHAR(100) NOT NULL,
          branch_id BIGINT NOT NULL,
          sport_category_id BIGINT NOT NULL,
          is_active BOOLEAN DEFAULT TRUE,
          images JSON,
          description TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT fk_branch FOREIGN KEY (branch_id) REFERENCES branch(id) ON DELETE CASCADE,
          CONSTRAINT fk_sport_category FOREIGN KEY (sport_category_id) REFERENCES sport_category(id) ON DELETE CASCADE
        );
      `);

    await queryRunner.query(`
      CREATE TABLE time_slot (
        id SERIAL PRIMARY KEY,
        sport_field_id INT NOT NULL,
        start_time VARCHAR(5) NOT NULL,
        end_time VARCHAR(5) NOT NULL,
        price_per_hour INT NOT NULL,
        is_active BOOLEAN DEFAULT TRUE,
        is_deleted BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_sport_field FOREIGN KEY (sport_field_id) REFERENCES sport_field(id) ON DELETE CASCADE
      );
    `);

    await queryRunner.query(`
        CREATE TABLE field_booking (
          id SERIAL PRIMARY KEY,
          user_id BIGINT NOT NULL,
          sport_field_id BIGINT NOT NULL,
          booking_date DATE NOT NULL,
          total_price int NOT NULL,
          start_time VARCHAR(5) NOT NULL,
          end_time VARCHAR(5) NOT NULL,
          status VARCHAR(50) DEFAULT 'PENDING',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
          CONSTRAINT fk_field_booking_user FOREIGN KEY (user_id) REFERENCES "user"(id) ON DELETE CASCADE,
          CONSTRAINT fk_field_booking_sport_field FOREIGN KEY (sport_field_id) REFERENCES sport_field(id) ON DELETE CASCADE
        );
      `);

    await queryRunner.query(`
        CREATE TABLE review (
          id SERIAL PRIMARY KEY,
          user_id BIGINT NOT NULL,
          field_booking_id BIGINT NOT NULL,
          comment TEXT NULL,
          rating INT DEFAULT 5 CHECK (rating BETWEEN 1 AND 5),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
          CONSTRAINT fk_review_user FOREIGN KEY (user_id) REFERENCES "user"(id) ON DELETE CASCADE,
          CONSTRAINT fk_review_field_booking FOREIGN KEY (field_booking_id) REFERENCES field_booking(id) ON DELETE CASCADE
        );
      `);

    await queryRunner.query(`
        ALTER TABLE branch 
        ADD COLUMN longtitude VARCHAR(30) NULL,
        ADD COLUMN latitude VARCHAR(30) NULL;
      `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE IF EXISTS sport_field');
    await queryRunner.query('DROP TABLE IF EXISTS time_slot');
    await queryRunner.query('DROP TABLE IF EXISTS field_booking');
    await queryRunner.query('DROP TABLE IF EXISTS review');
    await queryRunner.query(`
      ALTER TABLE branch 
      DROP COLUMN longitude,
      DROP COLUMN latitude;
    `);
  }
}
