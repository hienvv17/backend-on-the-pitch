import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { StaffService } from './staff.service';
import { CreateStaffDto } from './dtos/create-staff.dto';
import { ManagerJwtGuard } from '../auth/guard/manager-jwt.guard';
import { ResponseService } from '../response/response.service';

@Controller('staff')
@UseGuards(ManagerJwtGuard)
export class StaffController {
  constructor(
    private readonly staffService: StaffService,
    private responseService: ResponseService,
  ) {}

  @Post()
  async create(@Body() createStaffDto: CreateStaffDto) {
    const staff = await this.staffService.create(createStaffDto);
    return this.responseService.successResponse({ staff });
  }
  // To do : implement the filter

  @Get()
  async getAll() {
    const staffs = await this.staffService.getAll();
    return this.responseService.successResponse({ items: staffs });
  }
}
