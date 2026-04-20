import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';

import { BaseEntity } from '../../../common/entities/base.entity';
import { User } from '../../auth/entities/user.entity';

export enum ReviewVerdict {
  APPROVE = 'approve',
  REJECT = 'reject',
  OVERRIDE = 'override',
}

@Entity('verification_reviews')
export class VerificationReview extends BaseEntity {
  @Column()
  submissionId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'reviewerId' })
  reviewer: User;

  @Column()
  reviewerId: string;

  @Column({ type: 'enum', enum: ReviewVerdict })
  verdict: ReviewVerdict;

  @Column({ type: 'text', nullable: true })
  reason: string;

  // If moderator overrides AI score
  @Column({ type: 'float', nullable: true })
  overrideScore: number;
}
