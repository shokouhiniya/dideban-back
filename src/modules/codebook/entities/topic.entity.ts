import { Entity, Column, OneToMany } from 'typeorm';

import { BaseEntity } from '../../../common/entities/base.entity';
import { Subtopic } from './subtopic.entity';

@Entity('topics')
export class Topic extends BaseEntity {
  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column({ default: 0 })
  sortOrder: number;

  @OneToMany(() => Subtopic, (subtopic) => subtopic.topic)
  subtopics: Subtopic[];

  @Column({ default: true })
  isActive: boolean;
}
