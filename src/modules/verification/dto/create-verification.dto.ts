import { IsString, IsOptional, IsEnum, IsInt, IsJSON } from 'class-validator';
import { QueueItemType, Priority } from '../entities/verification-queue.entity';

export class CreateVerificationDto {
  @IsEnum(QueueItemType)
  item_type: QueueItemType;

  @IsInt()
  target_id: number;

  @IsOptional()
  @IsString()
  target_type?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  ai_suggestion?: Record<string, any>;

  @IsOptional()
  @IsEnum(Priority)
  priority?: Priority;
}
