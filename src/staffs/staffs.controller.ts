import { Controller, Get, Post, Body, UseGuards, Put, Param } from '@nestjs/common';
import { StaffsService } from './staffs.service';
import { CreateStaffDto } from './dtos/create-staff.dto';
import { ManagerJwtGuard } from '../auth/guard/manager-jwt.guard';
import { ResponseService } from '../response/response.service';
import { UpdateStaffDto } from './dtos/update-staff.dto';

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
  async getAll() {
    const staffs = await this.staffsService.getAll();
    return this.responseService.successResponse({ items: staffs });
  }
}
