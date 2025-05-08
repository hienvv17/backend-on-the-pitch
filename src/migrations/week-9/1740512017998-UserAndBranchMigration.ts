import { MigrationInterface, QueryRunner } from 'typeorm';

export class UserAndBranchMigration1740512017998 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // User Table
    await queryRunner.query(`
     
        CREATE TABLE "user" (
            id BIGSERIAL  PRIMARY KEY ,
            uid VARCHAR(128) NOT NULL UNIQUE,
            full_name VARCHAR(255),
            phone_number VARCHAR(10),
            email VARCHAR(255) NOT NULL UNIQUE,
            image VARCHAR(500),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );`);

    await queryRunner.query(`
      CREATE TYPE staff_role AS ENUM ('STAFF', 'MANAGER', 'ADMIN');

        CREATE TABLE staff (
            id BIGSERIAL  PRIMARY KEY ,
            uid VARCHAR(128),
            full_name VARCHAR(255),
            email VARCHAR(255) NOT NULL UNIQUE,
            phone_number VARCHAR(11) NOT NULL,
            role staff_role DEFAULT 'STAFF',
            is_active BOOLEAN DEFAULT TRUE,
            is_deleted BOOLEAN DEFAULT FALSE,
            active_date DATE DEFAULT CURRENT_TIMESTAMP,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ); `);

    await queryRunner.query(`
        CREATE TABLE branch (
            id BIGSERIAL  PRIMARY KEY ,
            name VARCHAR(255) NOT NULL,
            street VARCHAR(255) NOT NULL,
            ward VARCHAR(100) NOT NULL,
            district VARCHAR(100) NOT NULL,
            city VARCHAR(100) NOT NULL,
            images JSON,
            active_date DATE DEFAULT CURRENT_TIMESTAMP,
            is_active BOOLEAN DEFAULT TRUE,
            is_hot BOOLEAN DEFAULT FALSE,
            open_time VARCHAR(5) NOT NULL,
            close_time VARCHAR(5) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `);
    await queryRunner.query(`
       
        CREATE TABLE staff_branch (
            id BIGSERIAL  PRIMARY KEY ,
            staff_id BIGINT NOT NULL UNIQUE,
            branch_id BIGINT NOT NULL UNIQUE,
            is_deleted BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            CONSTRAINT fk_staff FOREIGN KEY (staff_id) REFERENCES staff(id) ON DELETE CASCADE,
            CONSTRAINT fk_branch FOREIGN KEY (branch_id) REFERENCES branch(id) ON DELETE CASCADE
        );
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('staff_branch');
    await queryRunner.dropTable('branch');
    await queryRunner.dropTable('staff');
    await queryRunner.dropTable('user');
  }
}
