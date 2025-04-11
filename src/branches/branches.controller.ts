import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
} from '@nestjs/common';
import { BranchesService } from './branches.service';
import { CreateBranchDto } from './dto/create-branch.dto';
import { UpdateBranchDto } from './dto/update-branch.dto';
import { UseGuards } from '@nestjs/common';
import { AdminJwtGuard } from '../auth/guard/admin-jwt.guard';
import { ResponseService } from '../response/response.service';

@Controller('branches')
export class BranchesController {
  constructor(
    private readonly branchesService: BranchesService,
    private readonly responseService: ResponseService,
  ) {}

  @Get()
  async getAll() {
    const branches = await this.branchesService.getAll();
    return this.responseService.successResponse({ items: branches });
  }

  @Get(':id')
  async getOne(@Param('id') id: string) {
    const branch = await this.branchesService.getOne(+id);
    return this.responseService.successResponse({ branch });
  }

  @UseGuards(AdminJwtGuard)
  @Post()
  async create(@Body() createBranchDto: CreateBranchDto) {
    await this.branchesService.create(createBranchDto);
    return this.responseService.successResponse();
  }

  @UseGuards(AdminJwtGuard)
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateBranchDto: UpdateBranchDto,
  ) {
    await this.branchesService.update(+id, updateBranchDto);
    return this.responseService.successResponse();
  }

  @UseGuards(AdminJwtGuard)
  @Delete(':id')
  async delete(@Param('id') id: string) {
    await this.branchesService.delete(+id);
    return this.responseService.successResponse();
  }
}
