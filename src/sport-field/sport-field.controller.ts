import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { ResponseService } from '../response/response.service';
import { SportFieldService } from './sport-field.service';
import { CreateSportFieldDto } from './dtos/create-sport-field.dto';
import { UpdateSportFieldDto } from './dtos/update-sport-field.dto';
import { AdminJwtGuard } from '../auth/guard/admin-jwt.guard';
import { GetAvailableFieldDto } from './dtos/get-available-field.dto';

@Controller('sport-field')
export class SportFieldController {
  constructor(
    private responseService: ResponseService,
    private sportFieldService: SportFieldService,
  ) {}

  @Get()
  async getAll(@Param('branchId') branchId: number) {
    const fields = await this.sportFieldService.getAll(branchId);
    return this.responseService.successResponse({ items: fields });
  }

  @UseGuards(AdminJwtGuard)
  @Post('create')
  async create(@Body() dto: CreateSportFieldDto) {
    await this.sportFieldService.create(dto);
    return this.responseService.successResponse();
  }

  @UseGuards(AdminJwtGuard)
  @Post('update')
  async update(
    @Param('sportFieldId') id: number,
    @Body() dto: UpdateSportFieldDto,
  ) {
    await this.sportFieldService.updateSportField(id, dto);
    return this.responseService.successResponse();
  }

  @UseGuards(AdminJwtGuard)
  @Delete()
  async delete(@Param() id: number) {
    await this.sportFieldService.deleteSportField(id);
    return this.responseService.successResponse();
  }

  @Post('available')
  async getAvailable(dto: GetAvailableFieldDto) {
    const availableFields = await this.sportFieldService.getAvailable(dto);
    return this.responseService.successResponse({ items: availableFields });
  }
}
