import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Put,
  Param,
  Query,
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
    @Query('limit') limit: number = 10,
    @Query('offset') offset: number = 0,
    @Query('search') search?: string,
    @Query('branchId') branchId?: number,
  ) {
    const { items, count } = await this.staffsService.getAll(
      limit,
      offset,
      branchId,
      search,
    );
    return this.responseService.successResponse({
      items,
      count,
    });
  }
}
