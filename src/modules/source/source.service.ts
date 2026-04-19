import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Source, SourceType, SourceCredibility, VerificationLine } from './entities/source.entity';
import { CreateSourceDto } from './dto/create-source.dto';
import { UpdateSourceDto } from './dto/update-source.dto';

@Injectable()
export class SourceService {
  constructor(
    @InjectRepository(Source)
    private sourceRepository: Repository<Source>,
  ) {}

  async create(createSourceDto: CreateSourceDto): Promise<Source> {
    const source = this.sourceRepository.create(createSourceDto);
    
    // Auto-assign verification line based on credibility
    if (source.credibility === SourceCredibility.WHITELIST) {
      source.verification_line = VerificationLine.GREEN;
    } else if (source.credibility === SourceCredibility.UNVERIFIED) {
      source.verification_line = VerificationLine.RED;
    } else {
      source.verification_line = VerificationLine.YELLOW;
    }
    
    return this.sourceRepository.save(source);
  }

  async findAll(
    credibility?: SourceCredibility,
    verificationLine?: VerificationLine,
  ): Promise<Source[]> {
    const where: any = {};
    if (credibility) where.credibility = credibility;
    if (verificationLine) where.verification_line = verificationLine;
    
    return this.sourceRepository.find({
      where,
      order: { created_at: 'DESC' },
      relations: ['statements'],
    });
  }

  async findOne(id: number): Promise<Source> {
    const source = await this.sourceRepository.findOne({
      where: { id },
      relations: ['statements'],
    });
    if (!source) {
      throw new NotFoundException(`Source with ID ${id} not found`);
    }
    return source;
  }

  async update(id: number, updateSourceDto: UpdateSourceDto): Promise<Source> {
    await this.sourceRepository.update(id, updateSourceDto);
    return this.findOne(id);
  }

  async verifySource(
    id: number,
    verifierId: number,
    credibility: SourceCredibility,
  ): Promise<Source> {
    let verificationLine = VerificationLine.YELLOW;
    if (credibility === SourceCredibility.WHITELIST) {
      verificationLine = VerificationLine.GREEN;
    } else if (credibility === SourceCredibility.UNVERIFIED) {
      verificationLine = VerificationLine.RED;
    }

    await this.sourceRepository.update(id, {
      is_verified: true,
      verified_by: verifierId,
      verified_at: new Date(),
      credibility,
      verification_line: verificationLine,
    });
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.sourceRepository.delete(id);
  }

  async findByUrl(url: string): Promise<Source | null> {
    return this.sourceRepository.findOne({ where: { url } });
  }

  async getPendingVerifications(): Promise<Source[]> {
    return this.sourceRepository.find({
      where: { is_verified: false },
      order: { created_at: 'ASC' },
    });
  }
}
