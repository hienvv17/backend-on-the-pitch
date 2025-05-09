import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  UseGuards,
  Query,
} from '@nestjs/common';
import { VouchersService } from './vouchers.service';
import { CreateVoucherDto } from './dto/create-voucher.dto';
import { ResponseService } from '../response/response.service';
import { UpdateVoucherConfigDto } from './dto/update-voucher-config';
import { JwtGuard } from '../auth/guard/jwt.guard';
import { GetUser } from '../auth/decorator/get-user.decorator';
import { AdminJwtGuard } from '../auth/guard/admin-jwt.guard';
import { ManagerJwtGuard } from '../auth/guard/manager-jwt.guard';
import { VoucherStatusType, VoucherType } from '../entities/vouchers.entity';
import { ApiTags } from '@nestjs/swagger';
import { CreateVoucherConfigDto } from './dto/create-voucher-config';

@ApiTags('Vouchers')
@Controller('vouchers')
export class VouchersController {
  constructor(
    private readonly vouchersService: VouchersService,
    private readonly responseService: ResponseService,
  ) {}

  @UseGuards(AdminJwtGuard)
  @Post('config')
  async create(@Body() dto: CreateVoucherConfigDto) {
    await this.vouchersService.createConfig(dto);
    return this.responseService.successResponse();
  }

  @UseGuards(AdminJwtGuard)
  @Post('manual-create')
  async createManual(@Body() dto: CreateVoucherDto) {
    await this.vouchersService.createManual(dto);
    return this.responseService.successResponse();
  }

  @UseGuards(AdminJwtGuard)
  @Put('config/:id')
  async updateConfig(
    @Param('id') id: number,
    @Body() dto: UpdateVoucherConfigDto,
  ) {
    await this.vouchersService.updateConfig(id, dto);
    return this.responseService.successResponse();
  }

  @UseGuards(AdminJwtGuard)
  @Get('config')
  async findAllConfig() {
    const config = await this.vouchersService.findAllConfig();
    return this.responseService.successResponse({ items: config });
  }

  @UseGuards(ManagerJwtGuard)
  @Get('manage')
  async findAllVoucher(
    @Query('limit') limit = 20,
    @Query('offset') offset = 0,
    @Query('status') status?: VoucherStatusType,
    @Query('type') type?: VoucherType,
    @Query('search') search?: string,
  ) {
    const config = await this.vouchersService.findManageAll(
      limit,
      offset,
      status,
      type,
      search,
    );
    return this.responseService.successResponse({ items: config });
  }

  @UseGuards(JwtGuard)
  @Get('my-voucher')
  async findOne(
    @GetUser('uid') uid: string,
    @Query('limit') limit = 20,
    @Query('offset') offset = 0,
  ) {
    const vouchers = await this.vouchersService.findMyVoucherAll(
      uid,
      limit,
      offset,
    );
    return this.responseService.successResponse({
      items: vouchers[0],
      count: vouchers[1],
    });
  }

  @UseGuards(JwtGuard)
  @Get('validate')
  async validate(@GetUser('uid') uid: string, @Query('code') code: string) {
    const validVoucher = await this.vouchersService.validate(uid, code);
    return this.responseService.successResponse({
      items: validVoucher,
    });
  }

  @UseGuards(AdminJwtGuard)
  @Delete('config/:id')
  async deleteConfig(@Param('id') id: string) {
    return this.vouchersService.removeConfig(+id);
  }
}
