import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository, TreeRepository } from 'typeorm';
import { Topic } from './entities/topic.entity';
import { CreateTopicDto } from './dto/create-topic.dto';
import { UpdateTopicDto } from './dto/update-topic.dto';

@Injectable()
export class TopicService {
  constructor(
    @InjectRepository(Topic)
    private topicRepository: Repository<Topic>,
  ) {}

  async create(createTopicDto: CreateTopicDto): Promise<Topic> {
    const topic = this.topicRepository.create(createTopicDto);
    if (createTopicDto.parent_id) {
      topic.parent = await this.findOne(createTopicDto.parent_id);
    }
    return this.topicRepository.save(topic);
  }

  async findAll(): Promise<Topic[]> {
    return this.topicRepository.find({
      relations: ['children'],
      where: { parent: IsNull() },
    });
  }

  async findTree(): Promise<Topic[]> {
    const manager = this.topicRepository.manager;
    const treeRepo = manager.getTreeRepository(Topic);
    return treeRepo.findTrees();
  }

  async findOne(id: number): Promise<Topic> {
    const topic = await this.topicRepository.findOne({
      where: { id },
      relations: ['children', 'parent'],
    });
    if (!topic) {
      throw new NotFoundException(`Topic with ID ${id} not found`);
    }
    return topic;
  }

  async update(id: number, updateTopicDto: UpdateTopicDto): Promise<Topic> {
    await this.topicRepository.update(id, updateTopicDto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.topicRepository.delete(id);
  }

  async findByCode(code: string): Promise<Topic | null> {
    return this.topicRepository.findOne({ where: { code } });
  }
}
