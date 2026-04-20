import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';

import { BaseEntity } from '../../../common/entities/base.entity';
import { Politician } from '../../politicians/entities/politician.entity';

export enum StanceStatus {
  PENDING = 'pending',
  VERIFIED = 'verified',
  REJECTED = 'rejected',
  AMBIGUOUS = 'ambiguous',
}

@Entity('stances')
export class Stance extends BaseEntity {
  @ManyToOne(() => Politician, (politician) => politician.stances)
  @JoinColumn({ name: 'politicianId' })
  politician: Politician;

  @Column()
  politicianId: string;

  // The exact quote - "اصالت متن"
  @Column({ type: 'text' })
  quote: string;

  // Topic and subtopic from codebook
  @Column()
  topicId: string;

  @Column({ nullable: true })
  subtopicId: string;

  // Score from codebook (0-5)
  @Column({ type: 'float', nullable: true })
  score: number;

  // AI justification for the score
  @Column({ type: 'text', nullable: true })
  aiJustification: string;

  // Speech Date vs Record Date (per system constraints)
  @Column({ type: 'date' })
  speechDate: Date;

  @Column({ type: 'date' })
  recordDate: Date;

  // Source information
  @Column()
  sourceUrl: string;

  @Column({ nullable: true })
  sourceName: string;

  // Verification status
  @Column({ type: 'enum', enum: StanceStatus, default: StanceStatus.PENDING })
  status: StanceStatus;

  // Is this a contradiction with previous stances?
  @Column({ default: false })
  isContradiction: boolean;

  @Column({ nullable: true })
  contradictionNote: string;

  // Ambiguity tag for conflicting sources
  @Column({ default: false })
  hasAmbiguityTag: boolean;
}
