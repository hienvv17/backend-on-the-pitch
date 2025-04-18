import { Injectable, BadRequestException } from '@nestjs/common';
import { BranchsEntity } from '../entities/branches.entity';
import { Repository } from 'typeorm';
import { CreateBranchDto } from './dto/create-branch.dto';
import { UpdateBranchDto } from './dto/update-branch.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { CacheService } from '../cache/cache.service';

@Injectable()
export class BranchesService {
  constructor(
    @InjectRepository(BranchsEntity)
    private branchRepo: Repository<BranchsEntity>,
    private readonly cacheService: CacheService
  ) { }

  async getPublicAll() {
    // select sport support
    const cacheKey = 'getPublicAllBraches'
    const cachedData = this.cacheService.get(cacheKey);
    if (cachedData) return cachedData;
    const branches = await this.branchRepo.createQueryBuilder('br')
      .leftJoin('sport_fields', 'sf', 'sf.branch_id = br.id')
      .leftJoin('sport_categories', 'sc', 'sc.id = sf.sport_category_id')
      .select('br.id', 'id')
      .addSelect('br.name', 'name')
      .addSelect('br.street', 'street')
      .addSelect('br.ward', 'ward')
      .addSelect('br.district', 'district')
      .addSelect('br.city', 'city')
      .addSelect('br.openTime', 'openTime')
      .addSelect('br.closeTime','closeTime')
      .addSelect('COUNT(sf.id)', 'total_fields')
      .addSelect(
        `JSON_AGG(DISTINCT JSONB_BUILD_OBJECT('id', sc.id, 'name', sc.name)) FILTER (WHERE sc.id IS NOT NULL)`,
        'sport_categories'
      )
      .where('sf.is_active = :active', { active: true })
      .andWhere('br.active_date < NOW()')
      .groupBy('br.id')
      .getRawMany();
    this.cacheService.set(cacheKey, branches, 300)
    return branches;
  }

  async getOne(id: number): Promise<BranchsEntity> {
    // return sport service have
    const cacheKey = `getPublicBranch-${id}`
    const branch = await this.branchRepo.findOne({
      where: { id }, select: {
        id: true,
        name: true,
        street: true, ward: true, district: true, city: true
      }
    });
    if (!branch) throw new BadRequestException('Branch do not exist');
    // const totalFields = await
    return branch;
  }

  async getPublicOne(id: number): Promise<BranchsEntity> {
    //to do: get total sportField - average price
    const branch = await this.branchRepo.findOne({ where: { id } });
    if (!branch) throw new BadRequestException('Branch do not exist');
    return branch;
  }

  async create(dto: CreateBranchDto) {
    return await this.branchRepo.save(dto);
  }

  async update(id: number, dto: UpdateBranchDto) {
    const branch = await this.branchRepo.findOne({ where: { id } });
    if (!branch) throw new BadRequestException('Branch do not exist');
    return await this.branchRepo.update(id, { ...dto, updatedAt: new Date() });
  }

  async delete(id: number) {
    const branch = await this.branchRepo.findOne({ where: { id } });
    if (!branch) throw new BadRequestException('Branch do not exist');
    return await this.branchRepo.delete(id);
  }
}
