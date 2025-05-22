import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Put,
  Delete,
} from '@nestjs/common';
import { SportCategoriesService } from './sport-categories.service';
import { ResponseService } from '../response/response.service';
import { CreateSportCategoryDto } from './dto/create-sport-category.dto';
import { AdminJwtGuard } from '../auth/guard/admin-jwt.guard';
import { ApiTags } from '@nestjs/swagger';
import { UpdateSportCategoryDto } from './dto/update-sport-category.dto';
import { StaffJwtGuard } from '../auth/guard/staff-jwt.guard';

@ApiTags('Sport Category')
@Controller('sport-categories')
export class SportCategoriesController {
  constructor(
    private readonly sportCategoriesService: SportCategoriesService,
    private readonly responseService: ResponseService,
  ) {}
  @UseGuards(AdminJwtGuard)
  @Post()
  async create(@Body() dto: CreateSportCategoryDto) {
    await this.sportCategoriesService.create(dto);
    return this.responseService.successResponse();
  }

  @Get()
  async findAll() {
    const sportCategories = await this.sportCategoriesService.getAll();
    return this.responseService.successResponse({ items: sportCategories });
  }

  @UseGuards(StaffJwtGuard)
  @Get('manage')
  async getManageAll() {
    const sportCategories = await this.sportCategoriesService.getManageAll();
    return this.responseService.successResponse({ items: sportCategories });
  }

  @Get(':id')
  async getOne(@Param('id') id: number) {
    const sportCategory = await this.sportCategoriesService.findOne(id);
    return this.responseService.successResponse({ sportCategory });
  }

  @Put(':id')
  async update(@Param('id') id: number, @Body() dto: UpdateSportCategoryDto) {
    const sportCategory = await this.sportCategoriesService.update(id, dto);
    return this.responseService.successResponse({ sportCategory });
  }

  @Delete(':id')
  async remove(@Param('id') id: number) {
    await this.sportCategoriesService.delete(id);
    return this.responseService.successResponse();
  }
}
