import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  UseGuards,
  Query,
  Request,
} from '@nestjs/common';
import { SportItemsService } from './sport-items.service';
import { CreateSportItemDto } from './dto/create-sport-item.dto';
import { AdminJwtGuard } from '../auth/guard/admin-jwt.guard';
import { ResponseService } from '../response/response.service';
import { ApiTags } from '@nestjs/swagger';
import { UpdateSportItemDto } from './dto/update-sport-item.dto';
import { ManagerJwtGuard } from 'src/auth/guard/manager-jwt.guard';
import { ImportItemDto } from './dto/import-item.dto';
import { StaffJwtGuard } from 'src/auth/guard/staff-jwt.guard';

@ApiTags('Sport Item')
@Controller('sport-items')
export class SportItemsController {
  constructor(
    private readonly sportItemsService: SportItemsService,
    private readonly responseService: ResponseService,
  ) {}

  @UseGuards(AdminJwtGuard)
  @Post()
  async create(@Body() createDto: CreateSportItemDto) {
    await this.sportItemsService.create(createDto);
    return this.responseService.successResponse();
  }

  @Get('manage')
  async findAll(
    @Query('limit') limit: number = 10,
    @Query('offset') offset: number = 0,
    @Query('order') order: string = 'ASC',
    @Query('sortKey') sortKey?: string,
    @Query('search') search?: string,
  ) {
    const { items, count } = await this.sportItemsService.findAll(
      limit,
      offset,
      order,
      sortKey,
      search,
    );
    return this.responseService.successResponse({ items, count });
  }

  @Get('manage/import-list')
  async findAllToImport(
    @Query('limit') limit: number = 10,
    @Query('offset') offset: number = 0,
    @Query('order') order: string = 'ASC',
    @Query('sortKey') sortKey?: string,
    @Query('search') search?: string,
  ) {
    const { items, count } = await this.sportItemsService.findAllToImport(
      limit,
      offset,
      order,
      sortKey,
      search,
    );
    return this.responseService.successResponse({ items, count });
  }

  // @Get(':id')
  // async findOne(@Param('id') id: number) {
  //   const item = await this.sportItemsService.findOne(+id);
  //   return this.responseService.successResponse({ item });
  // }

  @UseGuards(AdminJwtGuard)
  @Put(':id')
  async update(@Param('id') id: number, @Body() updateDto: UpdateSportItemDto) {
    console.log('updateDto', updateDto);
    await this.sportItemsService.update(+id, updateDto);
    return this.responseService.successResponse();
  }

  @UseGuards(AdminJwtGuard)
  @Delete(':id')
  async remove(@Param('id') id: number) {
    await this.sportItemsService.remove(+id);
    return this.responseService.successResponse({});
  }

  @UseGuards(ManagerJwtGuard)
  @Post('import-item')
  async importItem(@Request() req: any, @Body() importDto: ImportItemDto) {
    await this.sportItemsService.importItem(req, importDto);
    return this.responseService.successResponse();
  }

  @UseGuards(AdminJwtGuard)
  @Get('history-import')
  async getImportHistory(
    @Query('limit') limit: number = 10,
    @Query('offset') offset: number = 0,
    @Query('order') order: string = 'ASC',
    @Query('sortKey') sortKey?: string,
    @Query('search') search?: string,
  ) {
    const { items, count } = await this.sportItemsService.getImportHistory(
      limit,
      offset,
      order,
      sortKey,
      search,
    );
    return this.responseService.successResponse({ items, count });
  }

  @UseGuards(StaffJwtGuard)
  @Get('get-item-to-sold')
  async getItemToSold(
    @Query('limit') limit: number = 10,
    @Query('offset') offset: number = 0,
    @Query('order') order: string = 'ASC',
    @Query('branchId') branchId?: number,
    @Query('sortKey') sortKey?: string,
    @Query('search') search?: string,
  ) {
    const { items, count } = await this.sportItemsService.getItemToSold(
      limit,
      offset,
      order,
      branchId,
      sortKey,
      search,
    );
    return this.responseService.successResponse({ items, count });
  }

  @UseGuards(StaffJwtGuard)
  @Post('order-create')
  async orderCreate(
    @Request() req: any,
    @Body()
    data: {
      sportItemId: number;
      branchId: number;
      quantityChoosen: number;
      price: number;
    }[],
  ) {
    await this.sportItemsService.orderCreate(req, data);
    return this.responseService.successResponse();
  }
}
