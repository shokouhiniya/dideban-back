import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Statement } from '../../statement/entities/statement.entity';

export enum SourceType {
  NEWS_ARTICLE = 'news_article',
  SOCIAL_MEDIA = 'social_media',
  VIDEO = 'video',
  AUDIO = 'audio',
  DOCUMENT = 'document',
  USER_SUBMISSION = 'user_submission',
}

export enum SourceCredibility {
  WHITELIST = 'whitelist',
  VERIFIED = 'verified',
  CROWDSOURCED = 'crowdsourced',
  UNVERIFIED = 'unverified',
  DISPUTED = 'disputed',
}

export enum VerificationLine {
  GREEN = 'green',
  YELLOW = 'yellow',
  RED = 'red',
}

@Entity('sources')
export class Source {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  content: string;

  @Column({ nullable: true })
  url: string;

  @Column({ nullable: true })
  source_name: string;

  @Column({
    type: 'enum',
    enum: SourceType,
    default: SourceType.NEWS_ARTICLE,
  })
  type: SourceType;

  @Column({
    type: 'enum',
    enum: SourceCredibility,
    default: SourceCredibility.UNVERIFIED,
  })
  credibility: SourceCredibility;

  @Column({
    type: 'enum',
    enum: VerificationLine,
    default: VerificationLine.YELLOW,
  })
  verification_line: VerificationLine;

  @Column({ type: 'date', nullable: true })
  published_date: Date;

  @Column({ type: 'date', nullable: true })
  speech_date: Date;

  @Column({ nullable: true })
  author: string;

  @Column({ type: 'simple-array', nullable: true })
  tags: string[];

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @Column({ type: 'boolean', default: false })
  is_verified: boolean;

  @Column({ type: 'int', nullable: true })
  verified_by: number;

  @Column({ type: 'timestamp', nullable: true })
  verified_at: Date;

  @OneToMany(() => Statement, (statement) => statement.source)
  statements: Statement[];

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
