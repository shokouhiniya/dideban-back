import { Entity, Column, OneToMany } from 'typeorm';

import { BaseEntity } from '../../../common/entities/base.entity';
import { Stance } from '../../stances/entities/stance.entity';

@Entity('politicians')
export class Politician extends BaseEntity {
  // --- Core identity ---
  @Column()
  name: string;

  @Column({ nullable: true, unique: true })
  memberId: string;

  @Column({ nullable: true })
  avatar: string;

  @Column({ nullable: true })
  role: string;

  @Column({ type: 'text', nullable: true })
  bio: string;

  // --- Majlis-specific fields ---
  @Column({ nullable: true })
  profileUrl: string;

  @Column({ nullable: true })
  periodProvince: string;

  @Column({ nullable: true })
  birthDate: string;

  @Column({ nullable: true })
  birthPlace: string;

  @Column({ nullable: true })
  education: string;

  @Column({ nullable: true })
  fieldOfStudy: string;

  @Column({ type: 'text', nullable: true })
  occupation: string;

  @Column({ nullable: true })
  politicalParty: string;

  @Column({ type: 'text', nullable: true })
  committees: string;

  @Column({ nullable: true })
  constituency: string;

  @Column({ nullable: true })
  votesCount: string;

  @Column({ nullable: true })
  votesPercent: string;

  // --- Dideban scores (cached) ---
  @Column({ type: 'float', default: 0 })
  truthScore: number;

  @Column({ type: 'float', default: 0 })
  stabilityScore: number;

  @Column({ type: 'float', default: 0 })
  clarityScore: number;

  @Column({ type: 'float', default: 0 })
  populismScore: number;

  // --- Persona radar (6-axis) ---
  @Column({ type: 'jsonb', nullable: true })
  personaRadar: {
    aggressive: number;
    global: number;
    reformist: number;
    transparent: number;
    rational: number;
    formal: number;
  };

  // --- Keywords ---
  @Column({ type: 'simple-array', nullable: true })
  topKeywords: string[];

  // --- Aggregated profile JSON for fast page load ---
  @Column({ type: 'jsonb', nullable: true })
  aggregatedProfile: Record<string, any>;

  // --- Relations ---
  @OneToMany(() => Stance, (stance) => stance.politician)
  stances: Stance[];

  @Column({ default: true })
  isActive: boolean;
}
