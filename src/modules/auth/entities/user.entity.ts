import { Entity, Column } from 'typeorm';

import { BaseEntity } from '../../../common/entities/base.entity';

export enum UserRole {
  USER = 'user',
  CONTRIBUTOR = 'contributor',
  MODERATOR = 'moderator',
  ADMIN = 'admin',
}

@Entity('users')
export class User extends BaseEntity {
  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column()
  displayName: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.USER })
  role: UserRole;

  @Column({ default: 0 })
  activityScore: number;

  @Column({ default: true })
  isActive: boolean;
}
