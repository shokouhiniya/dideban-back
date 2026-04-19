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
import { Statement } from '../../statement/entities/statement.entity';
import { Topic } from '../../topic/entities/topic.entity';

export enum ScoreStatus {
  PENDING = 'pending',
  AI_GENERATED = 'ai_generated',
  HUMAN_VERIFIED = 'human_verified',
  HUMAN_OVERRIDDEN = 'human_overridden',
  DISPUTED = 'disputed',
}

@Entity('scores')
export class Score {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  score_value: number;

  @Column({ type: 'float', nullable: true })
  confidence: number;

  @Column({ type: 'text', nullable: true })
  justification: string;

  @Column({
    type: 'enum',
    enum: ScoreStatus,
    default: ScoreStatus.PENDING,
  })
  status: ScoreStatus;

  @Column({ type: 'text', nullable: true })
  evidence_quote: string;

  @Column({ type: 'jsonb', nullable: true })
  ai_reasoning: Record<string, any>;

  @Column({ type: 'int', nullable: true })
  verified_by: number;

  @Column({ type: 'timestamp', nullable: true })
  verified_at: Date;

  @Column({ type: 'text', nullable: true })
  verifier_notes: string;

  @ManyToOne(() => Person, (person) => person.scores)
  @JoinColumn({ name: 'person_id' })
  person: Person;

  @Column()
  person_id: number;

  @ManyToOne(() => Statement, (statement) => statement.scores)
  @JoinColumn({ name: 'statement_id' })
  statement: Statement;

  @Column()
  statement_id: number;

  @ManyToOne(() => Topic, (topic) => topic.scores, { eager: true })
  @JoinColumn({ name: 'topic_id' })
  topic: Topic;

  @Column()
  topic_id: number;

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
