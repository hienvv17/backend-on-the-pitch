import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
  Put,
  Param,
  Request,
} from '@nestjs/common';
import { ReviewsService } from './reviews.service';

import { ApiTags } from '@nestjs/swagger';
import { CreateReviewDto } from './dto/create-review.dto';
import { JwtGuard } from '../auth/guard/jwt.guard';
import { GetUser } from '../auth/decorator/get-user.decorator';
import { ResponseService } from '../response/response.service';
import { UpdateReviewDto } from './dto/update-review.dto';
import { ManagerJwtGuard } from '../auth/guard/manager-jwt.guard';

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
  async getManageAll(
    @Request() req: any,
    @Query('limit') limit = 10,
    @Query('offset') offset = 0,
    @Query('order') order: string = 'ASC',
    @Query('sortKey') sortKey?: string,
    @Query('branchId') branchId?: number,
    @Query('search') search?: string,
  ) {
    const { items, count } = await this.reviewsService.findAll(
      req.staff,
      +limit,
      +offset,
      order,
      sortKey,
      branchId,
      search,
    );
    return this.responseService.successResponse({
      items,
      count,
    });
  }

  @UseGuards(ManagerJwtGuard)
  @Put('manage/:id')
  async update(@Param('id') id: number, @Body() dto: UpdateReviewDto) {
    await this.reviewsService.update(id, dto);
    return this.responseService.successResponse();
  }

  @Get('top-reviews')
  async getTopRivew(@Query('branchId') branchId: number) {
    const reviews = await this.reviewsService.getTopReview(branchId);
    return this.responseService.successResponse({
      items: reviews,
    });
  }
}
