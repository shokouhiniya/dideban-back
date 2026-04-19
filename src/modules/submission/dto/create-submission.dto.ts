import { IsString, IsOptional, IsEnum, IsUrl, IsInt } from 'class-validator';
import { SubmissionType } from '../entities/submission.entity';

export class CreateSubmissionDto {
  @IsOptional()
  @IsUrl()
  url?: string;

  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsString()
  extracted_quote?: string;

  @IsOptional()
  @IsEnum(SubmissionType)
  type?: SubmissionType;

  @IsInt()
  person_id: number;

  @IsOptional()
  @IsInt()
  topic_id?: number;

  @IsOptional()
  metadata?: Record<string, any>;
}
