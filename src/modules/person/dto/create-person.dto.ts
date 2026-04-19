import {
  IsString,
  IsOptional,
  IsEnum,
  IsArray,
  IsUrl,
} from 'class-validator';
import { PoliticalRole } from '../entities/person.entity';

export class CreatePersonDto {
  @IsString()
  full_name: string;

  @IsOptional()
  @IsUrl()
  photo_url?: string;

  @IsOptional()
  @IsString()
  biography?: string;

  @IsOptional()
  @IsEnum(PoliticalRole)
  political_role?: PoliticalRole;

  @IsOptional()
  @IsString()
  current_position?: string;

  @IsOptional()
  @IsString()
  party_affiliation?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  social_media_handles?: string[];
}
