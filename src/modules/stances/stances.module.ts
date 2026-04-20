import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { StancesController } from './stances.controller';
import { StancesService } from './stances.service';
import { Stance } from './entities/stance.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Stance])],
  controllers: [StancesController],
  providers: [StancesService],
  exports: [StancesService],
})
export class StancesModule {}
