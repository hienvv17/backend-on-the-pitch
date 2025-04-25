import { MigrationInterface, QueryRunner } from 'typeorm';

export class FieldAndItemMigration1740512017999 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            -- Sport Category Table
            CREATE TABLE sport_category (
                id BIGSERIAL  PRIMARY KEY ,
                name VARCHAR(100) NOT NULL,
                is_active BOOLEAN DEFAULT TRUE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );

            -- Sport Item Table
            CREATE TABLE sport_item (
                id BIGSERIAL  PRIMARY KEY ,
                name VARCHAR(255) NOT NULL,
                images JSON,
                price INT NOT NULL,
                is_active BOOLEAN DEFAULT TRUE,
                is_delete BOOLEAN DEFAULT FALSE,
                description VARCHAR(500),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );

            -- Sport Item Branch Table
            CREATE TABLE sport_item_branch (
                id BIGSERIAL  PRIMARY KEY ,
                sport_item_id BIGINT NOT NULL,
                branch_id BIGINT NOT NULL,
                quantity BIGINT NOT NULL,
                last_modified_by VARCHAR(100) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                CONSTRAINT fk_sport_item FOREIGN KEY (sport_item_id) REFERENCES sport_item(id) ON DELETE CASCADE,
                CONSTRAINT fk_branch FOREIGN KEY (branch_id) REFERENCES branch(id) ON DELETE CASCADE
            );
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            DROP TABLE IF EXISTS sport_item_branch;
            DROP TABLE IF EXISTS sport_item;
            DROP TABLE IF EXISTS sport_category;
        `);
  }
}
