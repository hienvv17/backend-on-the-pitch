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
import { ApiTags } from '@nestjs/swagger';
import { StaffJwtGuard } from '../auth/guard/staff-jwt.guard';

@ApiTags('Bracnh')
@Controller('branches')
export class BranchesController {
  constructor(
    private readonly branchesService: BranchesService,
    private readonly responseService: ResponseService,
  ) {}

  @Get()
  async getPublicAll() {
    const branches = await this.branchesService.getPublicAll();
    return this.responseService.successResponse({ items: branches });
  }

  @UseGuards(StaffJwtGuard)
  @Get('manage')
  async getMangeAll() {
    const branches = await this.branchesService.getAll();
    return this.responseService.successResponse({ items: branches });
  }

  @Get(':id')
  async getPublicOne(@Param('id') id: string) {
    const branch = await this.branchesService.getPublicOne(+id);
    return this.responseService.successResponse({ branch });
  }

  @Get('manage/:id')
  async getMangeOne(@Param('id') id: string) {
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
