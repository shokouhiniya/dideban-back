import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Submission, SubmissionStatus, VerificationTier } from './entities/submission.entity';
import { CreateSubmissionDto } from './dto/create-submission.dto';
import { UpdateSubmissionDto } from './dto/update-submission.dto';

@Injectable()
export class SubmissionService {
  constructor(
    @InjectRepository(Submission)
    private submissionRepository: Repository<Submission>,
  ) {}

  async create(createSubmissionDto: CreateSubmissionDto): Promise<Submission> {
    const submission = this.submissionRepository.create(createSubmissionDto);
    
    // Auto-assign verification tier based on type
    if (submission.type === 'link' && submission.url) {
      const isWhitelist = this.checkWhitelist(submission.url);
      submission.verification_tier = isWhitelist ? VerificationTier.GREEN : VerificationTier.YELLOW;
    } else {
      submission.verification_tier = VerificationTier.RED;
    }
    
    return this.submissionRepository.save(submission);
  }

  async findAll(
    status?: SubmissionStatus,
    tier?: VerificationTier,
  ): Promise<Submission[]> {
    const where: any = {};
    if (status) where.status = status;
    if (tier) where.verification_tier = tier;
    
    return this.submissionRepository.find({
      where,
      relations: ['person'],
      order: { created_at: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Submission> {
    const submission = await this.submissionRepository.findOne({
      where: { id },
      relations: ['person'],
    });
    if (!submission) {
      throw new NotFoundException(`Submission with ID ${id} not found`);
    }
    return submission;
  }

  async update(id: number, updateSubmissionDto: UpdateSubmissionDto): Promise<Submission> {
    await this.submissionRepository.update(id, updateSubmissionDto);
    return this.findOne(id);
  }

  async vote(submissionId: number, userId: number, isUpvote: boolean): Promise<Submission> {
    const submission = await this.findOne(submissionId);
    
    if (!submission.voter_ids) submission.voter_ids = [];
    
    if (submission.voter_ids.includes(userId)) {
      throw new Error('User has already voted on this submission');
    }
    
    submission.voter_ids.push(userId);
    if (isUpvote) {
      submission.crowd_votes_up++;
    } else {
      submission.crowd_votes_down++;
    }
    
    return this.submissionRepository.save(submission);
  }

  async approve(id: number, verifierId: number, sourceId?: number, statementId?: number): Promise<Submission> {
    await this.submissionRepository.update(id, {
      status: SubmissionStatus.APPROVED,
      assigned_verifier_id: verifierId,
      converted_source_id: sourceId,
      converted_statement_id: statementId,
    });
    return this.findOne(id);
  }

  async reject(id: number, verifierId: number, notes?: string): Promise<Submission> {
    await this.submissionRepository.update(id, {
      status: SubmissionStatus.REJECTED,
      assigned_verifier_id: verifierId,
      verifier_notes: notes,
    });
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.submissionRepository.delete(id);
  }

  private checkWhitelist(url: string): boolean {
    // Simplified whitelist check - in production, this would check against a database
    const whitelistDomains = [
      'irna.ir',
      'isna.ir',
      'farsnews.com',
      'mehrnews.com',
      'tasnimnews.com',
    ];
    return whitelistDomains.some(domain => url.includes(domain));
  }
}
