import { Injectable, BadRequestException } from '@nestjs/common';
import { BranchsEntity } from '../entities/branches.entity';
import { Repository } from 'typeorm';
import { CreateBranchDto } from './dto/create-branch.dto';
import { UpdateBranchDto } from './dto/update-branch.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { CacheService } from '../cache/cache.service';
import { ReviewsService } from '../reviews/reviews.service';

@Injectable()
export class BranchesService {
  constructor(
    @InjectRepository(BranchsEntity)
    private branchRepo: Repository<BranchsEntity>,
    private readonly cacheService: CacheService,
    private readonly reviewService: ReviewsService,
  ) {}

  async getPublicAll() {
    const cacheKey = 'getPublicAllBraches';
    const cachedData = this.cacheService.get(cacheKey);
    if (cachedData) return cachedData;
    const branches = await this.branchRepo
      .createQueryBuilder('br')
      .leftJoin('sport_fields', 'sf', 'sf.branch_id = br.id')
      .leftJoin('sport_categories', 'sc', 'sc.id = sf.sport_category_id')
      .select('br.id', 'id')
      .addSelect('br.name', 'name')
      .addSelect('br.street', 'street')
      .addSelect('br.ward', 'ward')
      .addSelect('br.district', 'district')
      .addSelect('br.city', 'city')
      .addSelect('br.openTime', 'openTime')
      .addSelect('br.closeTime', 'closeTime')
      .addSelect('br.isHot', 'isHot')
      .addSelect('br.images', 'images')
      .addSelect('COUNT(sf.id)', 'total_fields')
      .addSelect('SUM(sf.default_price) / COUNT(sf.id)', 'averagePrice')
      .addSelect(
        `JSON_AGG(DISTINCT JSONB_BUILD_OBJECT('id', sc.id, 'name', sc.name)) FILTER (WHERE sc.id IS NOT NULL)`,
        'sport_categories',
      )
      .where('sf.is_active = :active', { active: true })
      .andWhere('br.is_active = :active', { active: true })
      .andWhere('br.active_date < NOW()')
      .groupBy('br.id')
      .getRawMany();
    this.cacheService.set(cacheKey, branches, 300);
    return branches;
  }

  async getAll() {
    const branches = await this.branchRepo
      .createQueryBuilder('branch')
      .leftJoinAndSelect('branch.fieldBranches', 'fieldBranch')
      .leftJoinAndSelect('fieldBranch.sportCategory', 'sportCategory') // Join the sportCategory
      .select([
        'branch',
        'fieldBranch.id',
        'sportCategory.id',
        'sportCategory.name', // Select sport name (add more if needed)
      ])
      .orderBy('branch.id', 'ASC')
      .getMany();

    return branches.map((branch) => ({
      ...branch,
      totalField: branch.fieldBranches.length,
      sports: [
        ...new Map(
          branch.fieldBranches
            .filter((fb) => fb.sportCategory)
            .map((fb) => [fb.sportCategory.id, fb.sportCategory]),
        ).values(), // Deduplicate sports
      ],
    }));
  }

  async getPublicOne(id: number) {
    const cacheKey = `getPublicBranch-${id}`;
    const cachedData = this.cacheService.get(cacheKey);
    if (cachedData) return cachedData;
    const topReviews = (await this.reviewService.getTopReview(id)) as any[];
    const branch = await this.branchRepo
      .createQueryBuilder('br')
      .leftJoin('sport_fields', 'sf', 'sf.branch_id = br.id')
      .leftJoin('sport_categories', 'sc', 'sc.id = sf.sport_category_id')
      .select('br.id', 'id')
      .addSelect('br.name', 'name')
      .addSelect('br.street', 'street')
      .addSelect('br.ward', 'ward')
      .addSelect('br.district', 'district')
      .addSelect('br.city', 'city')
      .addSelect('br.openTime', 'openTime')
      .addSelect('br.closeTime', 'closeTime')
      .addSelect('br.isHot', 'isHot')
      .addSelect('br.images', 'images')
      .addSelect('COUNT(sf.id)', 'totalFields')
      .addSelect('SUM(sf.default_price) / COUNT(sf.id)', 'averagePrice')
      .addSelect(
        `JSON_AGG(DISTINCT JSONB_BUILD_OBJECT('id', sc.id, 'name', sc.name)) FILTER (WHERE sc.is_active = true)`,
        'sportCategories',
      )
      .addSelect(
        `JSON_AGG(DISTINCT JSONB_BUILD_OBJECT('id', sf.id, 'name', sf.name, 'images', sf.images)) FILTER (WHERE sf.is_active = true)`,
        'sportFields',
      )
      .where('sf.is_active = :active', { active: true })
      .andWhere('sc.is_active = :active', { active: true })
      .andWhere('br.id =:id', { id: id })
      .andWhere('br.active_date < NOW()')
      .groupBy('br.id')
      .getRawOne();
    if (!branch) throw new BadRequestException('Branch do not exist');
    this.cacheService.set(
      cacheKey,
      {
        ...branch,
        averagePrice: parseInt(branch.averagePrice),
        topReviews: topReviews.map((review) => ({
          id: review.id,
          comment: review.comment,
          rating: review.rating,
          fieldName: review.fieldName,
          username: review.userName,
          userImage: review.userImage,
        })),
      },
      300,
    );
    return {
      ...branch,
      averagePrice: parseInt(branch.averagePrice),
      topReviews: topReviews.map((review) => ({
        id: review.id,
        comment: review.comment,
        rating: review.rating,
        fieldName: review.fieldName,
        username: review.userName,
        userImage: review.userImage,
      })),
    };
  }

  async getOne(id: number): Promise<BranchsEntity> {
    const branch = await this.branchRepo.findOne({ where: { id } });
    if (!branch) throw new BadRequestException('Branch do not exist');
    return branch;
  }

  async create(dto: CreateBranchDto) {
    // remove cache publice all when create
    const cacheKey = 'getPublicAllBraches';
    this.cacheService.del(cacheKey);
    return await this.branchRepo.save(dto);
  }

  async update(id: number, dto: UpdateBranchDto) {
    const cacheKey = 'getPublicAllBraches';
    const caccheKeOne = `getPublicBranch-${id}`;
    const branch = await this.branchRepo.findOne({ where: { id } });
    if (!branch) throw new BadRequestException('Branch do not exist');
    // remove cache when update
    this.cacheService.del(cacheKey);
    this.cacheService.del(caccheKeOne);
    return await this.branchRepo.update(id, { ...dto, updatedAt: new Date() });
  }

  async delete(id: number) {
    //remove cache when delete
    const cacheKey = 'getPublicAllBraches';
    const caccheKeOne = `getPublicBranch-${id}`;
    const branch = await this.branchRepo.findOne({ where: { id } });
    if (!branch) throw new BadRequestException('Branch do not exist');
    this.cacheService.del(cacheKey);
    this.cacheService.del(caccheKeOne);
    return await this.branchRepo.delete(id);
  }
}
