import {
  IsString,
  IsOptional,
  IsEnum,
  IsUrl,
  IsDateString,
  IsArray,
} from 'class-validator';
import { SourceType, SourceCredibility } from '../entities/source.entity';

export class CreateSourceDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsUrl()
  url?: string;

  @IsOptional()
  @IsString()
  source_name?: string;

  @IsOptional()
  @IsEnum(SourceType)
  type?: SourceType;

  @IsOptional()
  @IsEnum(SourceCredibility)
  credibility?: SourceCredibility;

  @IsOptional()
  @IsDateString()
  published_date?: Date;

  @IsOptional()
  @IsDateString()
  speech_date?: Date;

  @IsOptional()
  @IsString()
  author?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  metadata?: Record<string, any>;
}
