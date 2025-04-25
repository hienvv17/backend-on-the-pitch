import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  UseGuards,
} from '@nestjs/common';
import { SportItemsService } from './sport-items.service';
import { CreateSportItemDto } from './dto/create-sport-item.dto';
import { AdminJwtGuard } from '../auth/guard/admin-jwt.guard';
import { ResponseService } from '../response/response.service';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Sport Item')
@Controller('sport-items')
export class SportItemsController {
  constructor(
    private readonly sportItemsService: SportItemsService,
    private readonly responseService: ResponseService,
  ) {}

  // @UseGuards(AdminJwtGuard)
  @Post()
  async create(@Body() createDto: CreateSportItemDto) {
    await this.sportItemsService.create(createDto);
    return this.responseService.successResponse();
  }

  @Get()
  async findAll() {
    const [items, count] = await this.sportItemsService.findAll();
    return this.responseService.successResponse({ items, count });
  }

  @Get(':id')
  async findOne(@Param('id') id: number) {
    const item = await this.sportItemsService.findOne(+id);
    return this.responseService.successResponse({ item });
  }

  //   @Put(':id')
  //   update(@Param('id') id: number, @Body() updateDto: UpdateSportItemDto) {
  //     return this.sportItemsService.update(+id, updateDto);
  //   }

  @Delete(':id')
  async remove(@Param('id') id: number) {
    await this.sportItemsService.remove(+id);
    return this.responseService.successResponse({});
  }
}
