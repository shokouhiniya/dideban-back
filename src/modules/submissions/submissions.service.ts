import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Submission, VerificationLine, SubmissionStatus } from './entities/submission.entity';

// Whitelisted sources (Fast Track / Green Line)
const WHITELISTED_SOURCES = [
  'irna.ir',
  'isna.ir',
  'ilna.ir',
  'tasnimnews.com',
  'mehrnews.com',
  'farsnews.ir',
  'yjc.ir',
];

@Injectable()
export class SubmissionsService {
  constructor(
    @InjectRepository(Submission)
    private readonly submissionRepository: Repository<Submission>,
  ) {}

  async validateUrl(url: string) {
    try {
      const urlObj = new URL(url);
      const domain = urlObj.hostname.replace('www.', '');
      const isWhitelisted = WHITELISTED_SOURCES.some((source) =>
        domain.includes(source),
      );

      return {
        url,
        domain,
        isWhitelisted,
        verificationLine: isWhitelisted
          ? VerificationLine.GREEN
          : VerificationLine.YELLOW,
        // TODO: Fetch actual metadata from URL
        title: 'عنوان خبر استخراج شده',
        date: new Date().toISOString(),
        sourceName: domain,
      };
    } catch {
      return {
        url,
        isValid: false,
        error: 'Invalid URL format',
      };
    }
  }

  async create(data: {
    submittedById: string;
    politicianId: string;
    sourceUrl?: string;
    statement: string;
    topicId?: string;
    subtopicId?: string;
    notes?: string;
  }) {
    // Determine verification line
    let verificationLine = VerificationLine.RED;
    if (data.sourceUrl) {
      const validation = await this.validateUrl(data.sourceUrl);
      verificationLine = validation.isWhitelisted
        ? VerificationLine.GREEN
        : VerificationLine.YELLOW;
    }

    // Generate tracking code
    const trackingCode = `DDB-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 99999)).padStart(5, '0')}`;

    const submission = this.submissionRepository.create({
      ...data,
      verificationLine,
      trackingCode,
      status:
        verificationLine === VerificationLine.GREEN
          ? SubmissionStatus.AI_PROCESSING
          : SubmissionStatus.PENDING,
    });

    return this.submissionRepository.save(submission);
  }

  async findAll(params?: { limit?: number; offset?: number; status?: string }) {
    const query: any = {};
    if (params?.status) {
      query.status = params.status;
    }

    const [data, total] = await this.submissionRepository.findAndCount({
      where: query,
      take: params?.limit || 20,
      skip: params?.offset || 0,
      order: { createdAt: 'DESC' },
    });

    return { data, total };
  }

  async findOne(id: string) {
    return this.submissionRepository.findOne({ where: { id } });
  }
}
