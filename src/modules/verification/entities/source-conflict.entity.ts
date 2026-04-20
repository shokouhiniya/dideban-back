import { Entity, Column } from 'typeorm';

import { BaseEntity } from '../../../common/entities/base.entity';

export enum ConflictStatus {
  OPEN = 'open',
  RESOLVED = 'resolved',
}

@Entity('source_conflicts')
export class SourceConflict extends BaseEntity {
  @Column()
  politicianId: string;

  @Column()
  event: string;

  // Source A
  @Column()
  sourceAName: string;

  @Column({ type: 'text' })
  sourceAClaim: string;

  @Column({ nullable: true })
  sourceAUrl: string;

  // Source B
  @Column()
  sourceBName: string;

  @Column({ type: 'text' })
  sourceBClaim: string;

  @Column({ nullable: true })
  sourceBUrl: string;

  // Resolution
  @Column({ type: 'enum', enum: ConflictStatus, default: ConflictStatus.OPEN })
  status: ConflictStatus;

  @Column({ nullable: true })
  resolution: string; // 'source_a' | 'source_b' | 'both_contradictory'

  @Column({ nullable: true })
  resolvedById: string;
}
