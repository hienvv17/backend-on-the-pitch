import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository, QueryRunner } from 'typeorm';
import { SportFieldEntity } from '../entities/sport-field.entity';
import { BranchEntity } from '../entities/branch.entity';
import { SportCategoryEntity } from '../entities/sport-category.entity';
import {
  CreateSportFieldDto,
  TimeSlotInput,
} from './dtos/create-sport-field.dto';
import { UpdateSportFieldDto } from './dtos/update-sport-field.dto';
import { TimeSlotEntity } from 'src/entities/time-slot.entity';
import { GetAvailableFieldDto } from './dtos/get-available-field.dto';
@Injectable()
export class SportFieldService {
  constructor(
    @InjectRepository(SportFieldEntity)
    private sportFieldRepo: Repository<SportFieldEntity>,
    @InjectRepository(BranchEntity)
    private branchRepo: Repository<BranchEntity>,
    @InjectRepository(SportCategoryEntity)
    private sportCategoryRepo: Repository<SportCategoryEntity>,
    @InjectRepository(TimeSlotEntity)
    private timeSlotRepo: Repository<TimeSlotEntity>,
    private readonly dataSource: DataSource,
  ) {}

  async getAll(bracnhId: number) {
    return await this.sportFieldRepo.findAndCount({ where: { id: bracnhId } });
  }

  async create(dto: CreateSportFieldDto) {
    const {
      name,
      branchId,
      sportCategoryId,
      description,
      images,
      isActive,
      timeSlots,
    } = dto;
    const branch = await this.branchRepo.findOne({ where: { id: branchId } });
    if (!branch) throw new BadRequestException('Brach do not exist');
    const sportCategory = await this.sportCategoryRepo.findOne({
      where: { id: sportCategoryId },
    });
    if (!sportCategory)
      throw new BadRequestException('Sport type do not exist');

    const newField = await this.sportFieldRepo.save(
      this.sportFieldRepo.create({
        name,
        branchId,
        sportCategoryId,
        description,
        images,
        isActive,
      }),
    );

    if (!timeSlots && timeSlots.length > 0) {
      await this.createTimeSlot(newField.id, timeSlots);
    }
    return newField;
  }

  async createTimeSlot(sportFieldId: number, timeSlots: TimeSlotInput[]) {
    if (!timeSlots || timeSlots.length === 0) return;
    const sportField = await this.sportFieldRepo.findOne({
      where: { id: sportFieldId },
    });
    if (!sportField) {
      throw new BadRequestException(
        `Sport field with ID ${sportFieldId} not found`,
      );
    }
    const queryRunner: QueryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      await queryRunner.query(
        `UPDATE time_slot SET is_deleted = true, is_active = false  WHERE sport_field_id = $1`,
        [sportFieldId],
      );
      for (const slot of timeSlots) {
        await queryRunner.query(
          `INSERT INTO time_slot (sport_field_id, start_time, end_time, price_per_hour, is_active, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, NOW(), NOW())`,
          [sportFieldId, slot.startTime, slot.endTime, slot.pricePerHour, true],
        );
      }
      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new Error(`Transaction failed: ${error.message}`);
    } finally {
      await queryRunner.release();
    }
  }

  async updateSportField(
    id: number,
    updateDto: UpdateSportFieldDto,
  ): Promise<void> {
    const sportField = await this.sportCategoryRepo.findOne({
      where: { id },
    });

    if (!sportField) {
      throw new BadRequestException(`Sport field with ID ${id} not found`);
    }

    Object.assign(sportField, updateDto);
    await this.sportFieldRepo.save(sportField);
    if (!updateDto.timeSlots && updateDto.timeSlots.length > 0) {
      await this.createTimeSlot(id, updateDto.timeSlots);
    }
    return;
  }

  async deleteSportField(id: number): Promise<any> {
    const sportField = await this.sportCategoryRepo.findOne({
      where: { id },
    });

    if (!sportField) {
      throw new BadRequestException(`Sport field with ID ${id} not found`);
    }

    return await this.sportFieldRepo.delete(id);
  }

  async getAvailable(dto: GetAvailableFieldDto) {
    //to do get available field
    return dto;
  }
}
