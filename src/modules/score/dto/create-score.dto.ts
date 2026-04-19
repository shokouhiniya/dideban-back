import { IsInt, IsOptional, IsString, IsNumber } from 'class-validator';

export class CreateScoreDto {
  @IsInt()
  score_value: number;

  @IsOptional()
  @IsNumber()
  confidence?: number;

  @IsOptional()
  @IsString()
  justification?: string;

  @IsOptional()
  @IsString()
  evidence_quote?: string;

  @IsOptional()
  ai_reasoning?: Record<string, any>;

  @IsInt()
  person_id: number;

  @IsInt()
  statement_id: number;

  @IsInt()
  topic_id: number;
}
