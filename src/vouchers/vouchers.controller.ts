import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
} from '@nestjs/common';
import { VouchersService } from './vouchers.service';
import { CreateVoucherDto } from './dto/create-voucher.dto';
import { ResponseService } from '../response/response.service';
// import { UpdateVoucherDto } from './dto/update-voucher.dto';

@Controller('vouchers')
export class VouchersController {
  constructor(
    private readonly service: VouchersService,
    private readonly responseService: ResponseService,
  ) {}

  @Post('config')
  async create(@Body() dto: CreateVoucherDto) {
    await this.service.create(dto);
    return this.responseService.successResponse();
  }

  @Get()
  async findAll() {
    // return this.service.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.service.findOne(+id);
  }

  //   @Patch(':id')
  //   update(@Param('id') id: string, @Body() dto: UpdateVoucherDto) {
  //     return this.service.update(+id, dto);
  //   }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.service.remove(+id);
  }
}
