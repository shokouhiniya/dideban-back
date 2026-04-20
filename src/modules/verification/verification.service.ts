import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { VerificationReview, ReviewVerdict } from './entities/verification-review.entity';
import { SourceConflict, ConflictStatus } from './entities/source-conflict.entity';

@Injectable()
export class VerificationService {
  constructor(
    @InjectRepository(VerificationReview)
    private readonly reviewRepository: Repository<VerificationReview>,
    @InjectRepository(SourceConflict)
    private readonly conflictRepository: Repository<SourceConflict>,
  ) {}

  async getQueue(params?: { limit?: number; offset?: number }) {
    // TODO: Join with submissions to get pending items
    return { data: [], total: 0 };
  }

  async submitReview(data: {
    submissionId: string;
    reviewerId: string;
    verdict: ReviewVerdict;
    reason?: string;
    overrideScore?: number;
  }) {
    const review = this.reviewRepository.create(data);
    return this.reviewRepository.save(review);
  }

  async getConflicts() {
    return this.conflictRepository.find({
      where: { status: ConflictStatus.OPEN },
      order: { createdAt: 'DESC' },
    });
  }

  async getActivityLog(params?: { limit?: number; offset?: number; reviewerId?: string }) {
    const query: any = {};
    if (params?.reviewerId) {
      query.reviewerId = params.reviewerId;
    }

    const [data, total] = await this.reviewRepository.findAndCount({
      where: query,
      take: params?.limit || 50,
      skip: params?.offset || 0,
      order: { createdAt: 'DESC' },
      relations: ['reviewer'],
    });

    return { data, total };
  }
}
