import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { PoliticiansService } from './politicians.service';

@ApiTags('Politicians')
@Controller('politicians')
export class PoliticiansController {
  constructor(private readonly politiciansService: PoliticiansService) {}

  @Get()
  findAll(@Query('limit') limit?: number, @Query('offset') offset?: number) {
    return this.politiciansService.findAll({ limit, offset });
  }

  @Get('search')
  search(@Query('q') query: string) {
    return this.politiciansService.search(query);
  }

  @Get('trending')
  getTrending() {
    return this.politiciansService.getTrending();
  }

  @Get('top-performers')
  getTopPerformers() {
    return this.politiciansService.getTopPerformers();
  }

  @Get('compare')
  compare(@Query('ids') ids: string) {
    return this.politiciansService.compare(ids.split(','));
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.politiciansService.findOne(id);
  }

  @Get(':id/profile')
  getProfile(@Param('id') id: string) {
    return this.politiciansService.getProfile(id);
  }
}
