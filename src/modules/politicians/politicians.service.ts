import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';

import { Politician } from './entities/politician.entity';

@Injectable()
export class PoliticiansService {
  constructor(
    @InjectRepository(Politician)
    private readonly politicianRepository: Repository<Politician>,
  ) {}

  async findAll(params?: { limit?: number; offset?: number }) {
    const [data, total] = await this.politicianRepository.findAndCount({
      where: { isActive: true },
      take: params?.limit || 50,
      skip: params?.offset || 0,
      order: { name: 'ASC' },
    });

    return { data, total };
  }

  async search(query: string) {
    return this.politicianRepository
      .createQueryBuilder('p')
      .where('p.isActive = :active', { active: true })
      .andWhere(
        '(p.name ILIKE :q OR p.constituency ILIKE :q OR p.occupation ILIKE :q OR p.committees ILIKE :q)',
        { q: `%${query}%` },
      )
      .take(30)
      .getMany();
  }

  async findOne(id: string) {
    // Try memberId first (numeric), then UUID
    let politician = await this.politicianRepository.findOne({
      where: { memberId: id },
    });

    if (!politician) {
      politician = await this.politicianRepository.findOne({
        where: { id },
      });
    }

    if (!politician) {
      throw new NotFoundException('Politician not found');
    }

    return politician;
  }

  async getProfile(id: string) {
    const politician = await this.findOne(id);
    return {
      ...politician,
      profile: politician.aggregatedProfile,
    };
  }

  async getTrending() {
    return [];
  }

  async getTopPerformers() {
    return this.politicianRepository.find({
      where: { isActive: true },
      order: { stabilityScore: 'DESC' },
      take: 10,
    });
  }

  async compare(ids: string[]) {
    return this.politicianRepository.findByIds(ids);
  }
}
