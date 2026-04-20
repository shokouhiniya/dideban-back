import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { PoliticiansController } from './politicians.controller';
import { PoliticiansService } from './politicians.service';
import { Politician } from './entities/politician.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Politician])],
  controllers: [PoliticiansController],
  providers: [PoliticiansService],
  exports: [PoliticiansService],
})
export class PoliticiansModule {}
