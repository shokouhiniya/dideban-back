import {
  IsString,
  IsOptional,
  IsEnum,
  IsDateString,
  IsInt,
  IsBoolean,
  IsJSON,
} from 'class-validator';
import { StatementType, StatementStatus } from '../entities/statement.entity';

export class CreateStatementDto {
  @IsString()
  original_text: string;

  @IsOptional()
  @IsString()
  extracted_quote?: string;

  @IsOptional()
  @IsString()
  context?: string;

  @IsOptional()
  @IsEnum(StatementType)
  statement_type?: StatementType;

  @IsOptional()
  @IsEnum(StatementStatus)
  status?: StatementStatus;

  @IsOptional()
  @IsDateString()
  speech_date?: Date;

  @IsOptional()
  @IsDateString()
  promise_deadline?: Date;

  @IsOptional()
  @IsBoolean()
  is_promise_fulfilled?: boolean;

  @IsInt()
  person_id: number;

  @IsInt()
  source_id: number;

  @IsOptional()
  @IsInt()
  topic_id?: number;

  @IsOptional()
  ai_analysis?: string;

  @IsOptional()
  ai_justification?: string;

  @IsOptional()
  ai_metadata?: Record<string, any>;
}
