import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
} from '@nestjs/common';
import { BranchService } from './branch.service';
import { CreateBranchDto } from './dto/create-branch.dto';
import { UpdateBranchDto } from './dto/update-branch.dto';
import { UseGuards } from '@nestjs/common';
import { AdminJwtGuard } from '../auth/guard/admin-jwt.guard';
import { ResponseService } from '../response/response.service';

@Controller('branches')
export class BranchController {
  constructor(
    private readonly branchService: BranchService,
    private readonly responseService: ResponseService,
  ) {}

  @Get()
  async getAll() {
    const branches = await this.branchService.getAll();
    return this.responseService.successResponse({ items: branches });
  }

  @Get(':id')
  async getOne(@Param('id') id: string) {
    const branch = await this.branchService.getOne(+id);
    return this.responseService.successResponse({ branch });
  }

  @UseGuards(AdminJwtGuard)
  @Post()
  async create(@Body() createBranchDto: CreateBranchDto) {
    await this.branchService.create(createBranchDto);
    return this.responseService.successResponse();
  }

  @UseGuards(AdminJwtGuard)
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateBranchDto: UpdateBranchDto,
  ) {
    await this.branchService.update(+id, updateBranchDto);
    return this.responseService.successResponse();
  }

  @UseGuards(AdminJwtGuard)
  @Delete(':id')
  async delete(@Param('id') id: string) {
    await this.branchService.delete(+id);
    return this.responseService.successResponse();
  }
}
