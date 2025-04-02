import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { SportCategoryService } from './sport-category.service';
import { ResponseService } from '../response/response.service';
import { CreateSportCategoryDto } from './dto/create-sport-category.dto copy';
import { AdminJwtGuard } from '../auth/guard/admin-jwt.guard';

@UseGuards(AdminJwtGuard)
@Controller('sport-category')
export class SportCategoryController {
  constructor(
    private readonly sportCategoryService: SportCategoryService,
    private readonly responseService: ResponseService,
  ) {}

  @Post()
  async create(@Body() dto: CreateSportCategoryDto) {
    await this.sportCategoryService.create(dto);
    return this.responseService.successResponse();
  }

  @Get()
  async findAll() {
    const sportCategories = await this.sportCategoryService.getAll();
    return this.responseService.successResponse({ items: sportCategories });
  }

  @Get(':id')
  async getOne(@Param('id') id: number) {
    const sportCategory = await this.sportCategoryService.findOne(id);
    return this.responseService.successResponse({ sportCategory });
  }
}
