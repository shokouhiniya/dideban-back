import { IsString, IsOptional, IsInt, IsJSON, IsBoolean } from 'class-validator';

export class CreateTopicDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  code?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  coding_manual?: string;

  @IsOptional()
  @IsInt()
  min_score?: number;

  @IsOptional()
  @IsInt()
  max_score?: number;

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;

  @IsOptional()
  @IsInt()
  parent_id?: number;
}
