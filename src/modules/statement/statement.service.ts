import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Statement, StatementStatus, StatementType } from './entities/statement.entity';
import { CreateStatementDto } from './dto/create-statement.dto';
import { UpdateStatementDto } from './dto/update-statement.dto';
import { PersonService } from '../person/person.service';

@Injectable()
export class StatementService {
  constructor(
    @InjectRepository(Statement)
    private statementRepository: Repository<Statement>,
    private personService: PersonService,
  ) {}

  async create(createStatementDto: CreateStatementDto): Promise<Statement> {
    const statement = this.statementRepository.create(createStatementDto);
    const saved = await this.statementRepository.save(statement);
    
    // Increment person's statement count
    await this.personService.incrementStatementCount(saved.person_id);
    
    return saved;
  }

  async findAll(
    personId?: number,
    status?: StatementStatus,
    topicId?: number,
  ): Promise<Statement[]> {
    const where: any = {};
    if (personId) where.person_id = personId;
    if (status) where.status = status;
    if (topicId) where.topic_id = topicId;
    
    return this.statementRepository.find({
      where,
      order: { speech_date: 'DESC' },
      relations: ['person', 'source', 'topic', 'scores'],
    });
  }

  async findOne(id: number): Promise<Statement> {
    const statement = await this.statementRepository.findOne({
      where: { id },
      relations: ['person', 'source', 'topic', 'scores'],
    });
    if (!statement) {
      throw new NotFoundException(`Statement with ID ${id} not found`);
    }
    return statement;
  }

  async update(id: number, updateStatementDto: UpdateStatementDto): Promise<Statement> {
    await this.statementRepository.update(id, updateStatementDto);
    return this.findOne(id);
  }

  async flagContradiction(
    id: number,
    contradictionDetails: Record<string, any>,
  ): Promise<Statement> {
    await this.statementRepository.update(id, {
      is_contradiction_flagged: true,
      contradiction_details: contradictionDetails,
    });
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.statementRepository.delete(id);
  }

  async getTimelineByPerson(personId: number): Promise<Statement[]> {
    return this.statementRepository.find({
      where: { person_id: personId, status: StatementStatus.SCORED },
      order: { speech_date: 'DESC' },
      relations: ['topic', 'scores'],
    });
  }

  async getContradictions(): Promise<Statement[]> {
    return this.statementRepository.find({
      where: { is_contradiction_flagged: true },
      relations: ['person', 'topic'],
      order: { created_at: 'DESC' },
    });
  }
}
