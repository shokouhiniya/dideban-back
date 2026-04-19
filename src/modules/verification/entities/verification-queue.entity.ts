import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum QueueItemType {
  SOURCE_VERIFICATION = 'source_verification',
  STATEMENT_VERIFICATION = 'statement_verification',
  SCORE_VERIFICATION = 'score_verification',
  CONTRADICTION_REVIEW = 'contradiction_review',
  AMBIGUITY_TAG = 'ambiguity_tag',
}

export enum QueueItemStatus {
  PENDING = 'pending',
  ASSIGNED = 'assigned',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  REJECTED = 'rejected',
  ESCALATED = 'escalated',
}

export enum Priority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

@Entity('verification_queue')
export class VerificationQueue {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'enum',
    enum: QueueItemType,
  })
  item_type: QueueItemType;

  @Column({
    type: 'enum',
    enum: QueueItemStatus,
    default: QueueItemStatus.PENDING,
  })
  status: QueueItemStatus;

  @Column({
    type: 'enum',
    enum: Priority,
    default: Priority.MEDIUM,
  })
  priority: Priority;

  @Column()
  target_id: number;

  @Column({ nullable: true })
  target_type: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'jsonb', nullable: true })
  ai_suggestion: Record<string, any>;

  @Column({ type: 'int', nullable: true })
  assigned_to: number;

  @Column({ type: 'timestamp', nullable: true })
  assigned_at: Date;

  @Column({ type: 'int', nullable: true })
  completed_by: number;

  @Column({ type: 'timestamp', nullable: true })
  completed_at: Date;

  @Column({ type: 'text', nullable: true })
  verdict: string;

  @Column({ type: 'jsonb', nullable: true })
  verdict_details: Record<string, any>;

  @Column({ type: 'text', nullable: true })
  notes: string;

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
