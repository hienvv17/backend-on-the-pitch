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

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(ReviewsEntity)
    private readonly reviewRepo: Repository<ReviewsEntity>,
    @InjectRepository(UsersEntity)
    private readonly usersRepo: Repository<UsersEntity>,
    @InjectRepository(FieldBookingsEntity)
    private readonly fieldBookingsRepo: Repository<FieldBookingsEntity>,
  ) {}

  async create(uid: string, dto: CreateReviewDto) {
    const user = await this.usersRepo.findOne({ where: { uid: uid } });
    if (!user) throw new BadRequestException('You are not login');
    // Booked and paid by user success
    const fieldBooking = await this.fieldBookingsRepo.findOne({
      where: {
        id: dto.fieldBookingId,
        status: FieldBookingStatus.PAID,
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
    const review = this.reviewRepo.create(dto);
    return this.reviewRepo.save(review);
  }

  async findAll(limit = 10, offset = 0) {
    const [data, count] = await this.reviewRepo.findAndCount({
      skip: offset,
      take: limit,
      order: { createdAt: 'DESC' },
      relations: ['user', 'fieldBooking'],
    });

    return { data, count, limit, offset };
  }

  async update(id: number, dto: UpdateReviewDto) {
    const review = await this.reviewRepo.findOne({ where: { id } });
    if (!review) throw new Error('Review not found');
    Object.assign(review, dto);
    return this.reviewRepo.save(review);
  }
}
