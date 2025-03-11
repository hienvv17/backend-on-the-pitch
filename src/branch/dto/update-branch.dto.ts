import { CreateBranchDto } from './create-branch.dto';
import { PartialType } from '@nestjs/swagger';

export class UpdateBranchDto extends PartialType(CreateBranchDto) {}
