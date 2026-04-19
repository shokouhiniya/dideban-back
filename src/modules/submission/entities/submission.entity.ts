import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Person } from '../../person/entities/person.entity';

export enum SubmissionType {
  LINK = 'link',
  SCREENSHOT = 'screenshot',
  AUDIO = 'audio',
  VIDEO = 'video',
  TEXT_CLAIM = 'text_claim',
}

export enum SubmissionStatus {
  PENDING = 'pending',
  IN_REVIEW = 'in_review',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  NEEDS_MORE_INFO = 'needs_more_info',
}

export enum VerificationTier {
  GREEN = 'green',
  YELLOW = 'yellow',
  RED = 'red',
}

@Entity('submissions')
export class Submission {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  url: string;

  @Column({ type: 'text', nullable: true })
  content: string;

  @Column({ type: 'text', nullable: true })
  extracted_quote: string;

  @Column({
    type: 'enum',
    enum: SubmissionType,
    default: SubmissionType.LINK,
  })
  type: SubmissionType;

  @Column({
    type: 'enum',
    enum: SubmissionStatus,
    default: SubmissionStatus.PENDING,
  })
  status: SubmissionStatus;

  @Column({
    type: 'enum',
    enum: VerificationTier,
    default: VerificationTier.YELLOW,
  })
  verification_tier: VerificationTier;

  @Column({ nullable: true })
  submitted_by: number;

  @Column({ nullable: true })
  submitter_name: string;

  @Column({ type: 'int', default: 0 })
  crowd_votes_up: number;

  @Column({ type: 'int', default: 0 })
  crowd_votes_down: number;

  @Column({ type: 'simple-array', nullable: true })
  voter_ids: number[];

  @Column({ type: 'int', nullable: true })
  assigned_verifier_id: number;

  @Column({ type: 'text', nullable: true })
  verifier_notes: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @Column({ type: 'int', nullable: true })
  topic_id: number;

  @ManyToOne(() => Person, { eager: true })
  @JoinColumn({ name: 'person_id' })
  person: Person;

  @Column()
  person_id: number;

  @Column({ type: 'int', nullable: true })
  converted_source_id: number;

  @Column({ type: 'int', nullable: true })
  converted_statement_id: number;

  @CreateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)',
  })
  created_at: Date;

  @UpdateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)',
    onUpdate: 'CURRENT_TIMESTAMP(6)',
  })
  updated_at: Date;
}
