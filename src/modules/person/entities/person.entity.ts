import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Statement } from '../../statement/entities/statement.entity';
import { Score } from '../../score/entities/score.entity';

export enum PersonStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  PENDING = 'pending',
}

export enum PoliticalRole {
  PRESIDENT = 'president',
  MINISTER = 'minister',
  MP = 'mp',
  CANDIDATE = 'candidate',
  EXPERT = 'expert',
  ACTIVIST = 'activist',
  OTHER = 'other',
}

@Entity('persons')
export class Person {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  full_name: string;

  @Column({ nullable: true })
  photo_url: string;

  @Column({ nullable: true, type: 'text' })
  biography: string;

  @Column({
    type: 'enum',
    enum: PoliticalRole,
    default: PoliticalRole.OTHER,
  })
  political_role: PoliticalRole;

  @Column({ nullable: true })
  current_position: string;

  @Column({ nullable: true })
  party_affiliation: string;

  @Column({ type: 'simple-array', nullable: true })
  social_media_handles: string[];

  @Column({
    type: 'enum',
    enum: PersonStatus,
    default: PersonStatus.PENDING,
  })
  status: PersonStatus;

  @Column({ type: 'jsonb', nullable: true })
  aggregated_profile: Record<string, any>;

  @Column({ type: 'float', default: 0 })
  truth_score: number;

  @Column({ type: 'float', default: 0 })
  stability_score: number;

  @Column({ type: 'float', default: 0 })
  clarity_score: number;

  @Column({ type: 'float', default: 0 })
  populism_score: number;

  @Column({ type: 'float', default: 0 })
  promise_completion_rate: number;

  @Column({ type: 'int', default: 0 })
  total_statements: number;

  @Column({ type: 'int', default: 0 })
  total_promises: number;

  @Column({ type: 'int', default: 0 })
  fulfilled_promises: number;

  @OneToMany(() => Statement, (statement) => statement.person)
  statements: Statement[];

  @OneToMany(() => Score, (score) => score.person)
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
