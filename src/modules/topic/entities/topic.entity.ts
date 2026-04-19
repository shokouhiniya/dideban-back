import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Tree,
  TreeChildren,
  TreeParent,
  OneToMany,
} from 'typeorm';
import { Statement } from '../../statement/entities/statement.entity';
import { Score } from '../../score/entities/score.entity';

@Entity('topics')
@Tree('materialized-path')
export class Topic {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ nullable: true })
  code: string;

  @Column({ nullable: true, type: 'text' })
  description: string;

  @Column({ nullable: true, type: 'text' })
  coding_manual: string;

  @Column({ type: 'int', default: 0 })
  min_score: number;

  @Column({ type: 'int', default: 5 })
  max_score: number;

  @Column({ default: true })
  is_active: boolean;

  @TreeParent()
  parent: Topic;

  @TreeChildren()
  children: Topic[];

  @OneToMany(() => Statement, (statement) => statement.topic)
  statements: Statement[];

  @OneToMany(() => Score, (score) => score.topic)
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
