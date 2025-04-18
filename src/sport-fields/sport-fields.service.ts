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
import { FieldBookingsEntity, FieldBookingStatus } from 'src/entities/field-bookings.entity';
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
  ) { }

  async getAll(bracnhId: number) {
    return await this.sportFieldRepo.find({
      where: { isActive: true, branchId: bracnhId }, select: {
        id: true, name: true, images: true, description: true, branchId: true, sportCategoryId: true
      }
    })
  }

  async getMangeAll(bracnhId: number) {
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
      }),
    );

    if (!timeSlots && timeSlots.length > 0) {
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
        `UPDATE time_slot SET is_deleted = true, is_active = false  WHERE sport_field_id = $1`,
        [sportFieldId],
      );
      for (const slot of timeSlots) {
        await queryRunner.query(
          `INSERT INTO time_slot (sport_field_id, start_time, end_time, price_per_hour, is_active)
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
    const sportField = await this.sportCategoryRepo.findOne({
      where: { id },
    });

    if (!sportField) {
      throw new BadRequestException(`Sport field with ID ${id} not found`);
    }

    const { timeSlots } = updateDto;
    delete updateDto.timeSlots;
    await this.sportFieldRepo.update(id, {
      ...updateDto,
    });
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
    //to do: check if time is out of service time
    //to do get available field
    // get available field from branch with sport category
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
    const sportFields = await this.sportFieldRepo.find({
      where: { branchId, sportCategoryId },
    });

    let _endTime = endTime
    if (startTime) {
      if (!_endTime) {
        //to do : gen endtime from startTime
        _endTime = startTime
      }
    }
    // from field join to booking , array booking time to 
    let bookedFieldQuery = this.fieldBookingRepo.createQueryBuilder('booking')
      .leftJoin('sport_fields', 'sf', 'sf.id = booking.sport_field_id')
      .where('booking.bookingDate = :bookingDate', { bookingDate: date })
      .andWhere('sf.branch_id = :branchId', { branchId: branchId })
      .andWhere('booking.status NOT IN (:...status)', {
        status: [FieldBookingStatus.CANCELLED, FieldBookingStatus.REFUND]
      })
      .select('sf.id', 'id')
      .addSelect('sf.name', 'name')
      .addSelect(
        `json_agg(json_build_object('start_time', booking.start_time, 'end_time', booking.end_time))`,
        "booked_time_slots"
      )
      .groupBy('sf.id')
      .getRawMany()
    // if (startTime) {
    //   // filter field with availale have this time range
    //   bookedFieldQuery = bookedFieldQuery.andWhere(
    //     new Brackets(qb => {
    //       qb.where(
    //         new Brackets(ib => {
    //           ib.where('booking.startTime < :startTime', { startTime: dto.startTime })
    //             .andWhere('booking.endTime > :startTime', { startTime: dto.startTime })
    //         })
    //       )
    //         .orWhere(new Brackets(ib => {
    //           ib.where('booking.startTime < :endTime', { endTime: dto.endTime })
    //             .andWhere('booking.endTime > :endTime', { endTime: dto.endTime })
    //         }))
    //         .orWhere(new Brackets(ib => {
    //           ib.where('booking.startTime <= :startTime', { startTime: dto.startTime })
    //             .andWhere('booking.endTime >= :endTime', { endTime: dto.endTime })
    //         }))
    //         .orWhere(new Brackets(ib => {
    //           ib.where('booking.startTime >= :startTime', { startTime: dto.startTime })
    //             .andWhere('booking.endTime <= :endTime', { endTime: dto.endTime })
    //         }))
    //     })
    //   )
    // }

    /**
     * op1: 
     * get all booking in this day
     * get time of fieds
     * write helper and calculate available time
     */

    //to do: 
    /**
     * select field not booking in time range setting 
     */

    return bookedFieldQuery;
  }
}
