import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ReviewsEntity } from '../entities/reviews.entity';
import { CreateReviewDto } from './dto/create-review.dto';
import { UsersEntity } from '../entities/users.entity';
import {
  FieldBookingsEntity,
  FieldBookingStatus,
} from '../entities/field-bookings.entity';
import { UpdateReviewDto } from './dto/update-review.dto';
import { CacheService } from '../cache/cache.service';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(ReviewsEntity)
    private readonly reviewRepo: Repository<ReviewsEntity>,
    @InjectRepository(UsersEntity)
    private readonly usersRepo: Repository<UsersEntity>,
    @InjectRepository(FieldBookingsEntity)
    private readonly fieldBookingsRepo: Repository<FieldBookingsEntity>,
    private readonly cacheService: CacheService,
  ) {}

  async create(uid: string, dto: CreateReviewDto) {
    const user = await this.usersRepo.findOne({ where: { uid: uid } });
    if (!user) throw new BadRequestException('You are not login');
    // CHECK_IN status required
    const fieldBooking = await this.fieldBookingsRepo.findOne({
      where: {
        id: dto.fieldBookingId,
        status: FieldBookingStatus.CHECK_IN,
        userId: user.id,
      },
    });
    if (!fieldBooking)
      throw new BadRequestException(
        'Field booking information is incorrect, can not review',
      );
    // Can only review one time
    const existReview = await this.reviewRepo.findOne({
      where: { fieldBookingId: dto.fieldBookingId, userId: user.id },
    });
    if (existReview)
      throw new BadRequestException('You have already review this booking');
    const review = this.reviewRepo.create({
      userId: user.id,
      fieldBookingId: dto.fieldBookingId,
      comment: dto.comment,
      rating: dto.rating,
    });
    return this.reviewRepo.save(review);
  }

  async findAll(
    staff: any,
    limit = 10,
    offset = 0,
    order: string,
    sortKey: string,
    branchId?: number,
    search?: string,
  ) {
    const role = staff.role;
    const branchIds = staff.branchids.map(Number);
    const queryBuilder = this.reviewRepo
      .createQueryBuilder('review')
      .leftJoin('users', 'user', 'user.id = review.userId')
      .leftJoin(
        'field_bookings',
        'fieldBooking',
        'fieldBooking.id = review.fieldBookingId',
      )
      .leftJoin(
        'sport_fields',
        'sportField',
        'sportField.id = fieldBooking.sportFieldId',
      )
      .leftJoin('branches', 'branch', 'branch.id = sportField.branchId')
      .select([
        'review.id "id"',
        'review.comment "comment"',
        'review.rating "rating"',
        'review.createdAt "createdAt"',
        'review.updatedAt "updatedAt"',
        'review.isHidden "isHidden"',
        'review.isDeleted "isDeleted"',

        'fieldBooking.id "bookingId"',
        'fieldBooking.code "bookingCode"',
        `TO_CHAR(fieldBooking.bookingDate, 'YYYY-MM-DD') "bookingDate"`,
        'fieldBooking.startTime "startTime"',
        'fieldBooking.endTime "endTime"',
        'fieldBooking.status "bookingStatus"',

        'sportField.id "sportFieldId"',
        'sportField.name "sportFieldName"',

        'branch.name "branchName"',

        'user.id "userId"',
        'user.uid "uid"',
        'user.fullName "fullName"',
        'user.phoneNumber "phoneNumber"',
        'user.email "userEmail"',
      ]);

    if (role !== 'ADMIN') {
      queryBuilder.andWhere('branch.id IN (:...branchIds)', {
        branchIds: branchIds,
      });
    }
    if (search) {
      queryBuilder.andWhere(
        '(user.email ILIKE :search OR review.comment ILIKE :search)',
        { search: `%${search}%` },
      );
    }
    const sortBy = sortKey || 'review.createdAt';
    queryBuilder.orderBy(sortBy, order as any);
    if (branchId) {
      queryBuilder.andWhere('branch.id = :branchId', { branchId });
    }

    const [items, count] = await Promise.all([
      queryBuilder.limit(limit).offset(offset).getRawMany(),
      queryBuilder.getCount(),
    ]);
    return { items, count };
  }

  async getMyReviewAll(uid: string, limit = 10, offset = 0) {
    const [data, count] = await this.reviewRepo.findAndCount({
      skip: offset,
      take: limit,
      order: { createdAt: 'DESC' },
      where: { user: { uid: uid } },
      relations: ['fieldBooking'],
      select: {
        id: true,
        comment: true,
        rating: true,
        createdAt: true,
        fieldBooking: {
          id: true,
        },
      },
    });

    return { data, count };
  }

  async update(id: number, dto: UpdateReviewDto) {
    const review = await this.reviewRepo.findOne({ where: { id } });
    if (!review) throw new Error('Review not found');
    Object.assign(review, dto);
    return this.reviewRepo.save(review);
  }

  async getTopReview(branchId?: number) {
    const cacheKey = branchId ? `getTopReview-${branchId}` : 'getTopReview';
    const cacheData = this.cacheService.get(cacheKey);
    if (cacheData) return cacheData;
    let qb = this.reviewRepo
      .createQueryBuilder('review')
      .leftJoin('review.user', 'user')
      .leftJoin('review.fieldBooking', 'fieldBooking')
      .leftJoin('fieldBooking.sportField', 'sportField')
      .leftJoin('sportField.branch', 'branch')
      .where('review.isHidden = :isHidden', { isHidden: false })
      .andWhere('review.isDeleted = :isDeleted', { isDeleted: false })
      .andWhere('review.rating >= :minRating', { minRating: 4 })
      .orderBy('review.rating', 'DESC')
      .addOrderBy('review.createdAt', 'DESC')
      .take(10)
      .select([
        'review.id "id"',
        'review.comment "comment"',
        'review.rating "rating"',
        'review.createdAt "createdAt"',
        'fieldBooking.id "bookingId"',
        'fieldBooking.code "bookingCode"',
        'sportField.name "fieldName"',
        'branch.name "branchName"',
        'user.id "userId"',
        'user.fullName "userName"',
        'user.email "userEmail"',
        'user.image "userImage"',
      ]);

    if (branchId) {
      qb = qb.andWhere('branch.id = :branchId', { branchId });
    }
    const rawReviews = await qb.getRawMany();
    this.cacheService.set(cacheKey, rawReviews, 300);
    return rawReviews;
  }
}
