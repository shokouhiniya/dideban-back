import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Statement } from './entities/statement.entity';
import { StatementService } from './statement.service';
import { StatementController } from './statement.controller';
import { PersonModule } from '../person/person.module';
import { SourceModule } from '../source/source.module';

@Module({
  imports: [TypeOrmModule.forFeature([Statement]), PersonModule, SourceModule],
  providers: [StatementService],
  controllers: [StatementController],
  exports: [StatementService],
})
export class StatementModule {}
