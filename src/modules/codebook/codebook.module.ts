import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CodebookController } from './codebook.controller';
import { CodebookService } from './codebook.service';
import { Topic } from './entities/topic.entity';
import { Subtopic } from './entities/subtopic.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Topic, Subtopic])],
  controllers: [CodebookController],
  providers: [CodebookService],
  exports: [CodebookService],
})
export class CodebookModule {}
