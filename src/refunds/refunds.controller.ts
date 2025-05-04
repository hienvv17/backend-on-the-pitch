import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  Put,
  UseGuards,
  Query,
} from '@nestjs/common';
import { RefundsService } from './refunds.service';
import { RefundsEntity } from '../entities/refund.entity';
import { CreateRefundDto } from './dto/create-refund-request.dto';
import { GetUser } from 'src/auth/decorator/get-user.decorator';
import { ResponseService } from 'src/response/response.service';
import { UpdateRefundDto } from './dto/update-refund-request.dto';
import { AdminJwtGuard } from 'src/auth/guard/admin-jwt.guard';
import { ManagerJwtGuard } from 'src/auth/guard/manager-jwt.guard';
import { ApiTags } from '@nestjs/swagger';
import { JwtGuard } from 'src/auth/guard/jwt.guard';

@ApiTags('Refunds')
@Controller('refunds')
export class RefundsController {
  constructor(
    private readonly refundsService: RefundsService,
    private readonly responseService: ResponseService,
  ) {}

  @UseGuards(JwtGuard)
  @Post('request')
  async create(@GetUser('uid') uid: string, @Body() body: CreateRefundDto) {
    await this.refundsService.create(uid, body);
    return this.responseService.successResponse({
      message:
        'Yêu cầu hoàn tiền thành công, chúng tôi sẽ xem xét yêu cầu của bạn trong thời gian sớm nhất.',
    });
  }

  @Get()
  async findAll(
    @Query('limit') limit: number = 10,
    @Query('offset') offset: number = 0,
    @Query('status') status?: string,
    @Query('bracnhId') bracnhId?: number,
  ) {
    const { items, count } = await this.refundsService.findAll(
      limit,
      offset,
      status,
      bracnhId,
    );
    return this.responseService.successResponse({ items, count });
  }

  @UseGuards(ManagerJwtGuard)
  @Get('my-refunds')
  async findMyRefundAll(
    @GetUser('uid') uid: string,
    @Query('limit') limit: number = 10,
    @Query('offset') offset: number = 0,
    @Query('status') status?: string,
    @Query('code') code?: string,
  ) {
    const { items, count } = await this.refundsService.findMyRefundAll(
      uid,
      limit,
      offset,
      status,
      code,
    );
    return this.responseService.successResponse({ items, count });
  }

  //   @Get(':id')
  //   async findOne(@Param('id') id: string) {
  //     return await this.refundsService.findOne(+id);
  //   }

  //   @UseGuards(ManagerJwtGuard)
  @Put(':id')
  async update(@Param('id') id: string, @Body() body: UpdateRefundDto) {
    await this.refundsService.update(+id, body);
    return this.responseService.successResponse({
      message: 'Cập nhật yêu cầu hoàn tiền thành công',
    });
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return await this.refundsService.remove(+id);
  }
}
