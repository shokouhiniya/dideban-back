import { PartialType } from '@nestjs/mapped-types';
import { CreatePersonDto } from './create-person.dto';
import { IsEnum, IsOptional } from 'class-validator';
import { PersonStatus } from '../entities/person.entity';

export class UpdatePersonDto extends PartialType(CreatePersonDto) {
  @IsOptional()
  @IsEnum(PersonStatus)
  status?: PersonStatus;
}
