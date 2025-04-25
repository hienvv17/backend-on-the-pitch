import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { ReviewsService } from './reviews.service';

import { ApiTags } from '@nestjs/swagger';
import { CreateReviewDto } from './dto/create-review.dto';
import { JwtGuard } from '../auth/guard/jwt.guard';
import { GetUser } from '../auth/decorator/get-user.decorator';
import { ResponseService } from '../response/response.service';
import { AdminJwtGuard } from 'src/auth/guard/admin-jwt.guard';

@ApiTags('Reviews')
@Controller('reviews')
export class ReviewsController {
  constructor(
    private readonly reviewsService: ReviewsService,
    private readonly responseService: ResponseService,
  ) {}

  @UseGuards(JwtGuard)
  @Post()
  async create(@GetUser('uid') uid: string, @Body() dto: CreateReviewDto) {
    await this.reviewsService.create(uid, dto);
    return this.responseService.successResponse();
  }

  @Get()
  async findAll(@Query('limit') limit = 10, @Query('offset') offset = 0) {
    const { data, count } = await this.reviewsService.findAll(+limit, +offset);
    return this.responseService.successResponse({
      items: data,
      count,
      limit: +limit,
      offset: offset,
    });
  }

  @UseGuards(AdminJwtGuard)
  @Post('manage/update')
  async update(@GetUser('uid') uid: string, @Body() dto: CreateReviewDto) {
    await this.reviewsService.create(uid, dto);
    return this.responseService.successResponse();
  }
}
