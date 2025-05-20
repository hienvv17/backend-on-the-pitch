import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { AdminJwtGuard } from '../auth/guard/admin-jwt.guard';
import { ResponseService } from '../response/response.service';

@Controller('dashboard')
export class DashboardController {
  constructor(
    private readonly dashboardService: DashboardService,
    private readonly responseService: ResponseService) { }

  // @UseGuards(AdminJwtGuard)
  @Get()
  async getDashboard(@Param('year') year?: number, @Param('month') month?: number) {
    const data = await this.dashboardService.getDashboardData();
    return this.responseService.successResponse({ data }, 'Dashboard data retrieved successfully');
  }
}
