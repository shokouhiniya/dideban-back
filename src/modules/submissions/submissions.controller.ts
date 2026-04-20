import { Controller, Get, Post, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

import { SubmissionsService } from './submissions.service';

@ApiTags('Submissions')
@Controller('submissions')
export class SubmissionsController {
  constructor(private readonly submissionsService: SubmissionsService) {}

  @Post('validate-url')
  validateUrl(@Body() body: { url: string }) {
    return this.submissionsService.validateUrl(body.url);
  }

  @Post()
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  create(
    @Request() req,
    @Body()
    body: {
      politicianId: string;
      sourceUrl?: string;
      statement: string;
      topicId?: string;
      subtopicId?: string;
      notes?: string;
    },
  ) {
    return this.submissionsService.create({
      submittedById: req.user.id,
      ...body,
    });
  }

  @Get()
  findAll(
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
    @Query('status') status?: string,
  ) {
    return this.submissionsService.findAll({ limit, offset, status });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.submissionsService.findOne(id);
  }
}
