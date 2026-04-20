import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';

import { BaseEntity } from '../../../common/entities/base.entity';
import { Topic } from './topic.entity';

@Entity('subtopics')
export class Subtopic extends BaseEntity {
  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @ManyToOne(() => Topic, (topic) => topic.subtopics)
  @JoinColumn({ name: 'topicId' })
  topic: Topic;

  @Column()
  topicId: string;

  // Scoring guide for this subtopic (0-5 scale)
  @Column({ type: 'jsonb', nullable: true })
  scoringGuide: {
    score: number;
    description: string;
  }[];

  @Column({ default: 0 })
  sortOrder: number;

  @Column({ default: true })
  isActive: boolean;
}
