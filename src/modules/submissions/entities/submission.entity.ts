import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';

import { BaseEntity } from '../../../common/entities/base.entity';
import { User } from '../../auth/entities/user.entity';

export enum SubmissionStatus {
  PENDING = 'pending',
  GREEN_LINE = 'green_line',       // Whitelisted source -> direct to AI
  YELLOW_LINE = 'yellow_line',     // Unofficial source -> peer review
  RED_LINE = 'red_line',           // No source -> expert review
  AI_PROCESSING = 'ai_processing',
  VERIFIED = 'verified',
  REJECTED = 'rejected',
}

export enum VerificationLine {
  GREEN = 'green',   // Fast Track - whitelisted sources
  YELLOW = 'yellow', // Crowd Verification - unofficial sources
  RED = 'red',       // Expert Review - no source / claims
}

@Entity('submissions')
export class Submission extends BaseEntity {
  @ManyToOne(() => User)
  @JoinColumn({ name: 'submittedById' })
  submittedBy: User;

  @Column()
  submittedById: string;

  @Column()
  politicianId: string;

  // Source URL (may be empty for red line)
  @Column({ nullable: true })
  sourceUrl: string;

  // Extracted metadata from URL validation
  @Column({ nullable: true })
  sourceTitle: string;

  @Column({ nullable: true })
  sourceName: string;

  @Column({ type: 'date', nullable: true })
  sourceDate: Date;

  // The statement/quote
  @Column({ type: 'text' })
  statement: string;

  // Topic categorization
  @Column({ nullable: true })
  topicId: string;

  @Column({ nullable: true })
  subtopicId: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  // File uploads (screenshots, audio)
  @Column({ type: 'simple-array', nullable: true })
  attachments: string[];

  // Verification line
  @Column({ type: 'enum', enum: VerificationLine })
  verificationLine: VerificationLine;

  // Status
  @Column({ type: 'enum', enum: SubmissionStatus, default: SubmissionStatus.PENDING })
  status: SubmissionStatus;

  // Peer review votes (for yellow line)
  @Column({ type: 'jsonb', nullable: true })
  peerVotes: { userId: string; vote: 'approve' | 'reject'; date: Date }[];

  // Tracking code
  @Column({ unique: true })
  trackingCode: string;
}
