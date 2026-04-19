import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Score, ScoreStatus } from './entities/score.entity';
import { CreateScoreDto } from './dto/create-score.dto';
import { UpdateScoreDto } from './dto/update-score.dto';

@Injectable()
export class ScoreService {
  constructor(
    @InjectRepository(Score)
    private scoreRepository: Repository<Score>,
  ) {}

  async create(createScoreDto: CreateScoreDto): Promise<Score> {
    const score = this.scoreRepository.create({
      ...createScoreDto,
      status: ScoreStatus.AI_GENERATED,
    });
    return this.scoreRepository.save(score);
  }

  async findAll(
    personId?: number,
    topicId?: number,
    status?: ScoreStatus,
  ): Promise<Score[]> {
    const where: any = {};
    if (personId) where.person_id = personId;
    if (topicId) where.topic_id = topicId;
    if (status) where.status = status;
    
    return this.scoreRepository.find({
      where,
      relations: ['person', 'statement', 'topic'],
      order: { created_at: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Score> {
    const score = await this.scoreRepository.findOne({
      where: { id },
      relations: ['person', 'statement', 'topic'],
    });
    if (!score) {
      throw new NotFoundException(`Score with ID ${id} not found`);
    }
    return score;
  }

  async update(id: number, updateScoreDto: UpdateScoreDto): Promise<Score> {
    await this.scoreRepository.update(id, updateScoreDto);
    return this.findOne(id);
  }

  async verifyScore(
    id: number,
    verifierId: number,
    newScore?: number,
    notes?: string,
  ): Promise<Score> {
    const update: any = {
      status: ScoreStatus.HUMAN_VERIFIED,
      verified_by: verifierId,
      verified_at: new Date(),
      verifier_notes: notes,
    };
    if (newScore !== undefined) {
      update.score_value = newScore;
      update.status = ScoreStatus.HUMAN_OVERRIDDEN;
    }
    await this.scoreRepository.update(id, update);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.scoreRepository.delete(id);
  }

  async getScoresByPersonAndTopic(
    personId: number,
    topicId: number,
  ): Promise<Score[]> {
    return this.scoreRepository.find({
      where: { person_id: personId, topic_id: topicId },
      order: { created_at: 'DESC' },
    });
  }
}
