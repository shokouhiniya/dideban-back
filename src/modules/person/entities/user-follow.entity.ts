import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { Person } from './person.entity';

@Entity('user_follows')
@Unique(['user_id', 'person_id'])
export class UserFollow {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  user_id: number;

  @ManyToOne(() => Person, { eager: true })
  @JoinColumn({ name: 'person_id' })
  person: Person;

  @Column()
  person_id: number;

  @Column({ default: true })
  notify_on_new_statement: boolean;

  @Column({ default: true })
  notify_on_contradiction: boolean;

  @Column({ default: true })
  notify_on_score_change: boolean;

  @CreateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)',
  })
  created_at: Date;
}
