import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { AiService } from './ai.service';
import { AiController } from './ai.controller';
import { StatementModule } from '../statement/statement.module';
import { ScoreModule } from '../score/score.module';
import { TopicModule } from '../topic/topic.module';

@Module({
  imports: [HttpModule, StatementModule, ScoreModule, TopicModule],
  providers: [AiService],
  controllers: [AiController],
  exports: [AiService],
})
export class AiModule {}
