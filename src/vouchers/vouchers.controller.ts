import {
    Controller, Get, Post, Body, Patch, Param, Delete,
    UseGuards
} from '@nestjs/common';
import { VouchersService } from './vouchers.service';
import { ApiTags } from '@nestjs/swagger';
import { CreateVoucherDto } from './dto/create-voucher.dto';
import { UpdateVoucherDto } from './dto/update-voucher.dto';
import { JwtGuard } from '../auth/guard/jwt.guard';
import { GetUser } from '../auth/decorator/get-user.decorator';
import { AdminJwtGuard } from '../auth/guard/admin-jwt.guard';
import { ResponseService } from '../response/response.service';

@ApiTags('Vouchers')
@Controller('vouchers')
export class VouchersController {
    constructor(
        private readonly vouchersService: VouchersService,
        private readonly responseService: ResponseService) { }
/**
 * using voucher to pay, then refund, voucher will be used 
 * and cannot be used again
 * at the end of month, check paid in this month - gen voucher for next month
 * 1 voucher = 1 month
 * 1 voucher = 1 user
 */
    @Post()
    create(@Body() dto: CreateVoucherDto) {
        return this.vouchersService.create(dto);
    }

    @UseGuards(JwtGuard)
    @Get('my')
    getPersonalAll(@GetUser('uid') uid: string) {
        return this.vouchersService.getPersonalAll(uid);
    }

    @UseGuards(AdminJwtGuard)
    @Get('mange')
    async getMangeAll() {
        const [data, count] = await this.vouchersService.getMangeAll();
        return this.responseService.successResponse({ items: data, count })
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.vouchersService.findOne(+id);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() dto: UpdateVoucherDto) {
        return this.vouchersService.update(+id, dto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.vouchersService.remove(+id);
    }
}
