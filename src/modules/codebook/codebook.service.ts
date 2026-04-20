import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Topic } from './entities/topic.entity';
import { Subtopic } from './entities/subtopic.entity';

@Injectable()
export class CodebookService {
  constructor(
    @InjectRepository(Topic)
    private readonly topicRepository: Repository<Topic>,
    @InjectRepository(Subtopic)
    private readonly subtopicRepository: Repository<Subtopic>,
  ) {}

  async getTopics() {
    return this.topicRepository.find({
      where: { isActive: true },
      relations: ['subtopics'],
      order: { sortOrder: 'ASC' },
    });
  }

  async getSubtopics(topicId: string) {
    return this.subtopicRepository.find({
      where: { topicId, isActive: true },
      order: { sortOrder: 'ASC' },
    });
  }
}
