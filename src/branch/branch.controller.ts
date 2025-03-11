import {
  Controller,
  Post,
  Body,
  UseGuards,
  Put,
  Get,
  Param,
} from '@nestjs/common';
import { BranchService } from './branch.service';
import { AdminJwtGuard } from '../auth/guard/admin-jwt.guard';
import { CreateBranchDto } from './dto/create-branch.dto';
import { ResponseService } from '@src/response/response.service';
import { UpdateBranchDto } from './dto/update-branch.dto';

@UseGuards(AdminJwtGuard)
@Controller('branch')
export class BranchController {
  constructor(
    private readonly branchService: BranchService,
    private responseService: ResponseService,
  ) {}

  @Get()
  async getAll() {
    const items = await this.branchService.findAll();
    return this.responseService.successResponse({ items });
  }

  @Post()
  async create(@Body() data: CreateBranchDto) {
    const branch = await this.branchService.create(data);
    return this.responseService.successResponse(
      { branch },
      'Create new branch successfully',
    );
  }

  @Put()
  async update(@Body() body: { branchId: number; data: UpdateBranchDto }) {
    const branch = await this.branchService.update(body.branchId, body.data);
    return this.responseService.successResponse(
      { branch },
      'Update branch successfully',
    );
  }

  @Get('/:branchId')
  async getOne(@Param('branchId') branchId: number) {
    const branch = await this.branchService.findOne(branchId);
    return this.responseService.successResponse({ branch });
  }
}
