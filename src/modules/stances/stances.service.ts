import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Stance, StanceStatus } from './entities/stance.entity';

@Injectable()
export class StancesService {
  constructor(
    @InjectRepository(Stance)
    private readonly stanceRepository: Repository<Stance>,
  ) {}

  async findByPolitician(politicianId: string, filters?: { topic?: string }) {
    const query = this.stanceRepository
      .createQueryBuilder('stance')
      .where('stance.politicianId = :politicianId', { politicianId })
      .andWhere('stance.status = :status', { status: StanceStatus.VERIFIED });

    if (filters?.topic) {
      query.andWhere('stance.topicId = :topic', { topic: filters.topic });
    }

    // Order by speechDate (not recordDate) per system constraints
    query.orderBy('stance.speechDate', 'DESC');

    return query.getMany();
  }

  async getTimeline(politicianId: string, topic?: string) {
    const query = this.stanceRepository
      .createQueryBuilder('stance')
      .where('stance.politicianId = :politicianId', { politicianId })
      .andWhere('stance.status = :status', { status: StanceStatus.VERIFIED });

    if (topic) {
      query.andWhere('stance.topicId = :topic', { topic });
    }

    query.orderBy('stance.speechDate', 'ASC');

    const stances = await query.getMany();

    // Group by month for timeline visualization
    const timeline = stances.reduce((acc, stance) => {
      const month = stance.speechDate.toISOString().slice(0, 7);
      if (!acc[month]) {
        acc[month] = [];
      }
      acc[month].push(stance);
      return acc;
    }, {} as Record<string, Stance[]>);

    return timeline;
  }

  async getContradictions(politicianId: string) {
    return this.stanceRepository.find({
      where: {
        politicianId,
        isContradiction: true,
        status: StanceStatus.VERIFIED,
      },
      order: { speechDate: 'DESC' },
    });
  }
}
