import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Delete,
  UseGuards,
  Put,
} from '@nestjs/common';
import { ResponseService } from '../response/response.service';
import { SportFieldService } from './sport-fields.service';
import { CreateSportFieldDto } from './dtos/create-sport-field.dto';
import { UpdateSportFieldDto } from './dtos/update-sport-field.dto';
import { AdminJwtGuard } from '../auth/guard/admin-jwt.guard';
import { GetAvailableFieldDto } from './dtos/get-available-field.dto';
import { StaffJwtGuard } from './../auth/guard/staff-jwt.guard';

@Controller('sport-fields')
export class SportFieldsController {
  constructor(
    private responseService: ResponseService,
    private sportFieldsService: SportFieldService,
  ) { }

  @Get()
  async getAll(@Param('branchId') branchId: number) {
    const fields = await this.sportFieldsService.getAll(branchId);
    return this.responseService.successResponse({
      items: fields,
    });
  }

  @UseGuards(StaffJwtGuard)
  @Get('get-manage')
  async getManageAll(@Param('branchId') branchId: number) {
    const fields = await this.sportFieldsService.getMangeAll(branchId);
    return this.responseService.successResponse({
      items: fields[0],
      count: fields[1],
    });
  }

  @UseGuards(AdminJwtGuard)
  @Post()
  async create(@Body() dto: CreateSportFieldDto) {
    await this.sportFieldsService.create(dto);
    return this.responseService.successResponse();
  }

  @UseGuards(AdminJwtGuard)
  @Put(':sportFieldId')
  async update(
    @Param('sportFieldId') id: number,
    @Body() dto: UpdateSportFieldDto,
  ) {
    await this.sportFieldsService.updateSportField(id, dto);
    return this.responseService.successResponse();
  }

  @UseGuards(AdminJwtGuard)
  @Delete()
  async delete(@Param() id: number) {
    await this.sportFieldsService.deleteSportField(id);
    return this.responseService.successResponse();
  }

  @Post('available')
  async getAvailable(@Body() dto: GetAvailableFieldDto) {
    const availableFields = await this.sportFieldsService.getAvailable(dto);
    return this.responseService.successResponse({ items: availableFields });
  }
}
