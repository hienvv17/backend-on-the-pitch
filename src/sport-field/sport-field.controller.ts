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
    //to do: additon time-slot when create sportfield
    /**
     * from 05:30 to 07:30  price 250
     * 7h30 - 10h30: 200
     * 10h30 - 16h30 : 180
     * 16h30 - 17h30 :200
     * 17h30 - 24h00 : 300
     */
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
  async getAvailable() {
    //to do: get available field , time on brach on date, with day , time can be have or not
    return this.responseService.successResponse();
  }
}
