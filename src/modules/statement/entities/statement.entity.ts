import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Person } from '../../person/entities/person.entity';
import { Source } from '../../source/entities/source.entity';
import { Topic } from '../../topic/entities/topic.entity';
import { Score } from '../../score/entities/score.entity';

export enum StatementStatus {
  EXTRACTED = 'extracted',
  PENDING_VERIFICATION = 'pending_verification',
  VERIFIED = 'verified',
  SCORED = 'scored',
  REJECTED = 'rejected',
  AMBIGUOUS = 'ambiguous',
}

export enum StatementType {
  POLICY_POSITION = 'policy_position',
  PROMISE = 'promise',
  CLAIM = 'claim',
  PREDICTION = 'prediction',
  CRITICISM = 'criticism',
  DEFENSE = 'defense',
}

@Entity('statements')
export class Statement {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text' })
  original_text: string;

  @Column({ type: 'text', nullable: true })
  extracted_quote: string;

  @Column({ type: 'text', nullable: true })
  context: string;

  @Column({
    type: 'enum',
    enum: StatementType,
    default: StatementType.POLICY_POSITION,
  })
  statement_type: StatementType;

  @Column({
    type: 'enum',
    enum: StatementStatus,
    default: StatementStatus.EXTRACTED,
  })
  status: StatementStatus;

  @Column({ type: 'date', nullable: true })
  speech_date: Date;

  @Column({ type: 'date', nullable: true })
  promise_deadline: Date;

  @Column({ type: 'boolean', default: false })
  is_promise_fulfilled: boolean;

  @Column({ type: 'text', nullable: true })
  ai_analysis: string;

  @Column({ type: 'text', nullable: true })
  ai_justification: string;

  @Column({ type: 'jsonb', nullable: true })
  ai_metadata: Record<string, any>;

  @Column({ type: 'boolean', default: false })
  is_contradiction_flagged: boolean;

  @Column({ type: 'jsonb', nullable: true })
  contradiction_details: Record<string, any>;

  @ManyToOne(() => Person, (person) => person.statements, { eager: true })
  @JoinColumn({ name: 'person_id' })
  person: Person;

  @Column()
  person_id: number;

  @ManyToOne(() => Source, (source) => source.statements, { eager: true })
  @JoinColumn({ name: 'source_id' })
  source: Source;

  @Column()
  source_id: number;

  @ManyToOne(() => Topic, (topic) => topic.statements, { eager: true })
  @JoinColumn({ name: 'topic_id' })
  topic: Topic;

  @Column({ nullable: true })
  topic_id: number;

  @OneToMany(() => Score, (score) => score.statement)
  scores: Score[];

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
