import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository, QueryRunner, Brackets } from 'typeorm';
import { SportFieldsEntity } from '../entities/sport-fields.entity';
import { BranchsEntity } from '../entities/branches.entity';
import { SportCategoriesEntity } from '../entities/sport-categories.entity';
import {
  CreateSportFieldDto,
  TimeSlotInput,
} from './dtos/create-sport-field.dto';
import { UpdateSportFieldDto } from './dtos/update-sport-field.dto';
import { TimeSlotsEntity } from '../entities/time-slots.entity';
import { GetAvailableFieldDto } from './dtos/get-available-field.dto';
import {
  FieldBookingsEntity,
  FieldBookingStatus,
} from '../entities/field-bookings.entity';
import {
  getAvailableTimeSlots,
  mergeTimeSlots,
} from '../utils/helper/date-time.helper';
import { CacheService } from '../cache/cache.service';
@Injectable()
export class SportFieldService {
  constructor(
    @InjectRepository(SportFieldsEntity)
    private sportFieldRepo: Repository<SportFieldsEntity>,
    @InjectRepository(BranchsEntity)
    private branchRepo: Repository<BranchsEntity>,
    @InjectRepository(SportCategoriesEntity)
    private sportCategoryRepo: Repository<SportCategoriesEntity>,
    @InjectRepository(TimeSlotsEntity)
    private timeSlotRepo: Repository<TimeSlotsEntity>,
    @InjectRepository(FieldBookingsEntity)
    private fieldBookingRepo: Repository<FieldBookingsEntity>,
    private readonly dataSource: DataSource,
    private cacheService: CacheService,
  ) {}

  async getPublicAll(bracnhId: number) {
    const cacheKey = `getPublicSportFieldOnBranch-${bracnhId}`;
    let cachedData = this.cacheService.get(cacheKey);
    if (cachedData) return cachedData;
    const sportFields = await this.sportFieldRepo
      .createQueryBuilder('sf')
      .innerJoin('sport_categories', 'sc', 'sc.id = sf.sport_category_id')
      .where('sf.isActive = :isActive', { isActive: true })
      .select('sf.id', 'id')
      .addSelect('sf.name', 'name')
      .addSelect('sc.id', 'sportCategoryId')
      .addSelect('sf.defaultPrice', 'defaultPrice')
      .addSelect('sc.name', 'sportCategoryName')
      .addSelect(
        `COALESCE(
          (
            SELECT json_agg(timSlot_obj)
            FROM (
              SELECT
                json_build_object(
                  'id', ts.id,
                  'startTime', ts.start_time,
                  'endTime', ts.end_time,
                  'pricePerHour', ts.price_per_hour,
                  'sportFieldId', ts.sport_field_id
                ) AS timSlot_obj
              FROM time_slots ts
              WHERE sf.id = ts.sport_field_id AND ts.is_active = true
            ) AS timsSlots
          ), '[]'::json
        )`,
        'timsSlots',
      )
      .addSelect(
        `COALESCE(
          (
            SELECT json_agg(review_obj)
            FROM (
              SELECT
                json_build_object(
                  'id', r.id,
                  'comment', r.comment,
                  'rating', r.rating,
                  'userId', r.user_id,
                  'createdAt', r.created_at
                ) AS review_obj
              FROM reviews r
              JOIN field_bookings fb ON fb.id = r.field_booking_id
              WHERE fb.sport_field_id = sf.id AND r.is_deleted = false
              ORDER BY r.rating DESC
              LIMIT 20
            ) AS top_reviews
          ), '[]'::json
        )`,
        'reviews',
      )
      .groupBy('sf.id')
      .addGroupBy('sc.id')
      .getRawMany();
    this.cacheService.set(cacheKey, sportFields, 300);
    return sportFields;
  }

  async getMangeAll(
    limit: number,
    offset: number,
    bracnhId?: number,
    sportCategoryId?: number,
  ) {
    let query = this.sportFieldRepo
      .createQueryBuilder('sf')
      .innerJoin('sport_categories', 'sc', 'sc.id = sf.sport_category_id')
      .innerJoin('branches', 'b', 'b.id = sf.branch_id')
      .leftJoin('time_slots', 'ts', 'ts.sport_field_id = sf.id')
      .select('sf.id', 'id');
    if (bracnhId) {
      query = query.where('sf.branchId = :branchId', { branchId: bracnhId });
    }
    if (sportCategoryId) {
      query = query.andWhere('sf.sportCategoryId = :sportCategoryId', {
        sportCategoryId,
      });
    }
    query = query
      .addSelect('sf.name', 'name')
      .addSelect('sc.id', 'sportCategoryId')
      .addSelect('sf.defaultPrice', 'defaultPrice')
      .addSelect('sc.name', 'sportCategoryName')
      .addSelect('sf.description', 'description')
      .addSelect('sf.images', 'images')
      .addSelect('b.name', 'branchName')
      .addSelect('b.id', 'branchId')
      .addSelect(
        `COALESCE(
    json_agg(
       json_build_object(
          'id', ts.id,
          'startTime', ts.start_time,
          'endTime', ts.end_time,
          'pricePerHour', ts.price_per_hour
        )
  
    ), '[]'::json
  )
  `,
        'timeSlots',
      )
      .addSelect('sf.createdAt', 'createdAt')
      .addSelect('sf.updatedAt', 'updatedAt')
      .addSelect('sf.isActive', 'isActive')
      .groupBy('sf.id')
      .addGroupBy('sc.id')
      .addGroupBy('b.name')
      .addGroupBy('b.id');
    const [items, count] = await Promise.all([
      query.orderBy('sf.id', 'ASC').limit(limit).offset(offset).getRawMany(),
      query.getCount(),
    ]);
    return { items, count };
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
      defaultPrice,
    } = dto;
    const branch = await this.branchRepo.findOne({ where: { id: branchId } });
    //to do: validate payload timeSlots later do in FE 1 time
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
        defaultPrice,
      }),
    );

    if (!timeSlots && timeSlots?.length > 0) {
      await this.createTimeSlot(newField.id, timeSlots);
    }
    return newField;
  }

  async createTimeSlot(sportFieldId: number, timeSlots: TimeSlotInput[]) {
    console.log('timeSlots', timeSlots);
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
        `UPDATE time_slots SET is_deleted = true, is_active = false  WHERE sport_field_id = $1`,
        [sportFieldId],
      );
      for (const slot of timeSlots) {
        await queryRunner.query(
          `INSERT INTO time_slots (sport_field_id, start_time, end_time, price_per_hour, is_active)
           VALUES ($1, $2, $3, $4, $5)`,
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
    const sportField = await this.sportFieldRepo.findOne({
      where: { id },
    });

    if (!sportField) {
      throw new BadRequestException(`Sport field with ID ${id} not found`);
    }

    const { timeSlots } = updateDto;
    delete updateDto.timeSlots;

    await this.sportFieldRepo.update(id, {
      ...updateDto,
      updatedAt: new Date(),
    });
    console.log(updateDto);
    if (timeSlots && timeSlots.length > 0) {
      await this.createTimeSlot(id, timeSlots);
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
    const { branchId, sportCategoryId, date, startTime, endTime } = dto;
    const branch = await this.branchRepo.findOne({
      where: { id: branchId },
    });
    if (!branch) throw new BadRequestException('Branch do not exist');
    const sportCategory = await this.sportCategoryRepo.findOne({
      where: { id: sportCategoryId },
    });
    if (!sportCategory)
      throw new BadRequestException('Sport type do not exist');

    let _endTime = endTime;
    if (startTime) {
      if (!_endTime) {
        //to do : gen endtime from startTime
        _endTime = startTime;
      }
    }

    let fieldInfo = await this.sportFieldRepo
      .createQueryBuilder('sf')
      .leftJoin('field_bookings', 'fb', 'sf.id = fb.sport_field_id')
      .select('sf.id', 'id')
      .addSelect('sf.name', 'name')
      .addSelect('sf.defaultPrice', 'defaultPrice')
      .addSelect(
        `COALESCE(
      json_agg(
        CASE 
          WHEN fb.bookingDate = :bookingDate 
            AND fb.status NOT IN (:...status)
          THEN json_build_object(
            'startTime', fb.start_time,
            'endTime', fb.end_time
          )
        END
      ) FILTER (WHERE fb.bookingDate = :bookingDate), '[]'::json
    )
    `,
        'bookedTimeSlots',
      )
      .setParameters({
        bookingDate: date,
        status: [FieldBookingStatus.CANCELLED, FieldBookingStatus.REFUND],
      })
      .where('sf.isActive = :isActive', { isActive: true })
      .andWhere('sf.branchId = :branchId', { branchId })
      .andWhere('sf.sportCategoryId = :sportCategoryId', {
        sportCategoryId,
      })
      .groupBy('sf.id')
      .orderBy('sf.id')
      .getRawMany();

    fieldInfo = fieldInfo.map((field) => {
      return {
        ...field,
        bookedTimeSlots: mergeTimeSlots(field.bookedTimeSlots),
      };
    });

    return fieldInfo.map((field) => {
      return {
        ...field,
        availableTimeSlots: getAvailableTimeSlots(
          field.bookedTimeSlots,
          branch.openTime,
          branch.closeTime,
        ),
        openTime: branch.openTime,
        closeTime: branch.closeTime,
      };
    });
  }
}
