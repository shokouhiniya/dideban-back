import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProfileService } from './profile.service';
import { ProfileController } from './profile.controller';
import { Person } from '../person/entities/person.entity';
import { PersonModule } from '../person/person.module';
import { ScoreModule } from '../score/score.module';
import { StatementModule } from '../statement/statement.module';
import { AiModule } from '../ai/ai.module';

@Module({
  imports: [TypeOrmModule.forFeature([Person]), PersonModule, ScoreModule, StatementModule, AiModule],
  providers: [ProfileService],
  controllers: [ProfileController],
  exports: [ProfileService],
})
export class ProfileModule {}
