import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VerificationQueue, QueueItemStatus, QueueItemType, Priority } from './entities/verification-queue.entity';
import { CreateVerificationDto } from './dto/create-verification.dto';
import { UpdateVerificationDto } from './dto/update-verification.dto';

@Injectable()
export class VerificationService {
  constructor(
    @InjectRepository(VerificationQueue)
    private verificationRepository: Repository<VerificationQueue>,
  ) {}

  async create(createDto: CreateVerificationDto): Promise<VerificationQueue> {
    const item = this.verificationRepository.create(createDto);
    return this.verificationRepository.save(item);
  }

  async findAll(
    status?: QueueItemStatus,
    itemType?: QueueItemType,
  ): Promise<VerificationQueue[]> {
    const where: any = {};
    if (status) where.status = status;
    if (itemType) where.item_type = itemType;
    
    return this.verificationRepository.find({
      where,
      order: { priority: 'DESC', created_at: 'ASC' },
    });
  }

  async findOne(id: number): Promise<VerificationQueue> {
    const item = await this.verificationRepository.findOne({
      where: { id },
    });
    if (!item) {
      throw new NotFoundException(`Verification item with ID ${id} not found`);
    }
    return item;
  }

  async assignToVerifier(id: number, verifierId: number): Promise<VerificationQueue> {
    await this.verificationRepository.update(id, {
      status: QueueItemStatus.ASSIGNED,
      assigned_to: verifierId,
      assigned_at: new Date(),
    });
    return this.findOne(id);
  }

  async complete(
    id: number,
    verifierId: number,
    verdict: string,
    details?: Record<string, any>,
  ): Promise<VerificationQueue> {
    await this.verificationRepository.update(id, {
      status: QueueItemStatus.COMPLETED,
      completed_by: verifierId,
      completed_at: new Date(),
      verdict,
      verdict_details: details,
    });
    return this.findOne(id);
  }

  async getPendingForVerifier(verifierId: number): Promise<VerificationQueue[]> {
    return this.verificationRepository.find({
      where: [
        { status: QueueItemStatus.PENDING },
        { status: QueueItemStatus.ASSIGNED, assigned_to: verifierId },
      ],
      order: { priority: 'DESC', created_at: 'ASC' },
    });
  }
}
