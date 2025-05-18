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
  Request,
} from '@nestjs/common';
import { RefundsService } from './refunds.service';
import { CreateRefundDto } from './dto/create-refund-request.dto';
import { GetUser } from '../auth/decorator/get-user.decorator';
import { ResponseService } from '../response/response.service';
import { UpdateRefundDto } from './dto/update-refund-request.dto';
import { ManagerJwtGuard } from '../auth/guard/manager-jwt.guard';
import { ApiTags } from '@nestjs/swagger';
import { JwtGuard } from '../auth/guard/jwt.guard';
import { ProcessRefundDto } from './dto/process-refund.dto';

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

  @UseGuards(ManagerJwtGuard)
  @Get('manage')
  async findAll(
    @Request() req: any,
    @Query('limit') limit: number = 10,
    @Query('offset') offset: number = 0,
    @Query('order') order: string = 'DESC',
    @Query('sortKey') sortKey?: string,
    @Query('status') status?: string,
    @Query('bracnhId') bracnhId?: number,
    @Query('search') search?: string,
  ) {
    const { items, count } = await this.refundsService.findAll(
      req,
      limit,
      offset,
      order,
      sortKey,
      status,
      bracnhId,
      search,
    );
    return this.responseService.successResponse({ items, count });
  }

  @UseGuards(JwtGuard)
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

  @UseGuards(ManagerJwtGuard)
  @Post('process-refund/:id')
  async processRefund(
    @Request() req: any,
    @Param('id') id: string,
    @Body() body: ProcessRefundDto,
  ) {
    await this.refundsService.acceptRefund(req, +id, body);
    return this.responseService.successResponse({
      message: 'Yêu cầu hoàn tiền đã được xử lý thành công',
    });
  }

  @UseGuards(ManagerJwtGuard)
  @Put('reject/:id')
  async rejectRefund(
    @Request() req: any,
    @Param('id') id: string,
    @Body() body: UpdateRefundDto,
  ) {
    await this.refundsService.rejectRefund(req, +id, body);
    return this.responseService.successResponse({
      message: 'Yêu cầu hoàn tiền đã được từ chối thành công',
    });
  }
}
