import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { SportCategoriesService } from './sport-categories.service';
import { ResponseService } from '../response/response.service';
import { CreateSportCategoryDto } from './dto/create-sport-category.dto';
import { AdminJwtGuard } from '../auth/guard/admin-jwt.guard';

@UseGuards(AdminJwtGuard)
@Controller('sport-categories')
export class SportCategoriesController {
  constructor(
    private readonly sportCategoriesService: SportCategoriesService,
    private readonly responseService: ResponseService,
  ) {}

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

  @Get(':id')
  async getOne(@Param('id') id: number) {
    const sportCategory = await this.sportCategoriesService.findOne(id);
    return this.responseService.successResponse({ sportCategory });
  }
}
