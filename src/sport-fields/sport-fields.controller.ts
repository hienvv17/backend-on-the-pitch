import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Delete,
  UseGuards,
  Put,
  Query,
} from '@nestjs/common';
import { ResponseService } from '../response/response.service';
import { SportFieldService } from './sport-fields.service';
import { CreateSportFieldDto } from './dtos/create-sport-field.dto';
import { UpdateSportFieldDto } from './dtos/update-sport-field.dto';
import { AdminJwtGuard } from '../auth/guard/admin-jwt.guard';
import { GetAvailableFieldDto } from './dtos/get-available-field.dto';
import { StaffJwtGuard } from './../auth/guard/staff-jwt.guard';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Sport Field')
@Controller('sport-fields')
export class SportFieldsController {
  constructor(
    private responseService: ResponseService,
    private sportFieldsService: SportFieldService,
  ) {}

  //@UseGuards(StaffJwtGuard)
  @Get('manage')
  async getManageAll(
    @Query('limit') limit: number = 10,
    @Query('offset') offset: number = 0,
    @Query('branchId') branchId?: number,
    @Query('search') sportCategoryId?: number,
  ) {
    const { items, count } = await this.sportFieldsService.getMangeAll(
      limit,
      offset,
      branchId,
      sportCategoryId,
    );
    return this.responseService.successResponse({
      items,
      count,
    });
  }

  //@UseGuards(AdminJwtGuard)
  @Post()
  async create(@Body() dto: CreateSportFieldDto) {
    await this.sportFieldsService.create(dto);
    return this.responseService.successResponse();
  }

  //@UseGuards(AdminJwtGuard)

  @Put(':sportFieldId')
  async update(
    @Param('sportFieldId') id: number,
    @Body() dto: UpdateSportFieldDto,
  ) {
    await this.sportFieldsService.updateSportField(id, dto);
    return this.responseService.successResponse();
  }

  //@UseGuards(AdminJwtGuard)
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

  @Get(':branchId')
  async getPublicAll(@Param('branchId') branchId: number) {
    const fields = await this.sportFieldsService.getPublicAll(branchId);
    return this.responseService.successResponse({
      items: fields,
    });
  }
}
