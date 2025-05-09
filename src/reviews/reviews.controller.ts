import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
  Put,
  Param,
} from '@nestjs/common';
import { ReviewsService } from './reviews.service';

import { ApiTags } from '@nestjs/swagger';
import { CreateReviewDto } from './dto/create-review.dto';
import { JwtGuard } from '../auth/guard/jwt.guard';
import { GetUser } from '../auth/decorator/get-user.decorator';
import { ResponseService } from '../response/response.service';
import { AdminJwtGuard } from '../auth/guard/admin-jwt.guard';
import { UpdateReviewDto } from './dto/update-review.dto';
import { ManagerJwtGuard } from 'src/auth/guard/manager-jwt.guard';

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

  @UseGuards(JwtGuard)
  @Get('my-reviews')
  async getAllMyReview(
    @GetUser('uid') uid: string,
    @Query('limit') limit = 10,
    @Query('offset') offset = 0,
  ) {
    const { data, count } = await this.reviewsService.getMyReviewAll(
      uid,
      +limit,
      +offset,
    );
    return this.responseService.successResponse({
      items: data,
      count,
      limit: +limit,
      offset: offset,
    });
  }

  @UseGuards(ManagerJwtGuard)
  @Get('manage')
  async getManageAll(@Query('limit') limit = 10, @Query('offset') offset = 0) {
    const { data, count } = await this.reviewsService.findAll(+limit, +offset);
    return this.responseService.successResponse({
      items: data,
      count,
    });
  }

  @UseGuards(ManagerJwtGuard)
  @Put('manage')
  async update(@Param('id') id: number, @Body() dto: UpdateReviewDto) {
    await this.reviewsService.update(id, dto);
    return this.responseService.successResponse();
  }

  @Get('top-reviews')
  async getTopRivew() {
    const reviews = await this.reviewsService.getTopReview();
    return this.responseService.successResponse({
      items: reviews,
    });
  }
}
