import { IsNumber, IsOptional, IsObject, IsInt } from 'class-validator';

export class UpdateAggregatedProfileDto {
  @IsOptional()
  @IsNumber()
  truth_score?: number;

  @IsOptional()
  @IsNumber()
  stability_score?: number;

  @IsOptional()
  @IsNumber()
  clarity_score?: number;

  @IsOptional()
  @IsNumber()
  populism_score?: number;

  @IsOptional()
  @IsNumber()
  promise_completion_rate?: number;

  @IsOptional()
  @IsInt()
  total_statements?: number;

  @IsOptional()
  @IsInt()
  total_promises?: number;

  @IsOptional()
  @IsInt()
  fulfilled_promises?: number;

  @IsOptional()
  @IsObject()
  radar_scores?: Record<string, number>;

  @IsOptional()
  @IsObject()
  topic_scores?: Record<string, number>;

  @IsOptional()
  @IsObject()
  latest_contradiction?: Record<string, any>;

  @IsOptional()
  @IsObject()
  personality_analysis?: Record<string, any>;
}
