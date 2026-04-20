import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { StancesService } from './stances.service';

@ApiTags('Stances')
@Controller('politicians/:politicianId/stances')
export class StancesController {
  constructor(private readonly stancesService: StancesService) {}

  @Get()
  findAll(
    @Param('politicianId') politicianId: string,
    @Query('topic') topic?: string,
  ) {
    return this.stancesService.findByPolitician(politicianId, { topic });
  }

  @Get('timeline')
  getTimeline(
    @Param('politicianId') politicianId: string,
    @Query('topic') topic?: string,
  ) {
    return this.stancesService.getTimeline(politicianId, topic);
  }

  @Get('contradictions')
  getContradictions(@Param('politicianId') politicianId: string) {
    return this.stancesService.getContradictions(politicianId);
  }
}
