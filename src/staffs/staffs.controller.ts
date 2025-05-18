import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Put,
  Param,
  Query,
  Delete,
  Request,
} from '@nestjs/common';
import { StaffsService } from './staffs.service';
import { CreateStaffDto } from './dtos/create-staff.dto';
import { ManagerJwtGuard } from '../auth/guard/manager-jwt.guard';
import { ResponseService } from '../response/response.service';
import { UpdateStaffDto } from './dtos/update-staff.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Staff')
@Controller('staffs')
@UseGuards(ManagerJwtGuard)
export class StaffsController {
  constructor(
    private readonly staffsService: StaffsService,
    private responseService: ResponseService,
  ) {}

  @Post()
  async create(@Body() createStaffDto: CreateStaffDto) {
    const staff = await this.staffsService.create(createStaffDto);
    return this.responseService.successResponse({ staff });
  }
  // To do : implement the filter

  @Put(':staffId')
  async update(
    @Param('staffId') staffId: number,
    @Body() updateStaffDto: UpdateStaffDto,
  ) {
    const staff = await this.staffsService.update(staffId, updateStaffDto);
    return this.responseService.successResponse({ staff });
  }

  @Get()
  async getAll(
    @Request() req: any,
    @Query('limit') limit: number = 10,
    @Query('offset') offset: number = 0,
    @Query('order') order: string = 'ASC',
    @Query('sortKey') sortKey?: string,
    @Query('search') search?: string,
    @Query('branchId') branchId?: number,
  ) {
    const { items, count } = await this.staffsService.getAll(
      req,
      limit,
      offset,
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

  @Delete(':staffId')
  async delete(@Param('staffId') staffId: number) {
    const staff = await this.staffsService.delete(staffId);
    return this.responseService.successResponse({ staff });
  }
}
