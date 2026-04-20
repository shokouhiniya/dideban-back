import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { CodebookService } from './codebook.service';

@ApiTags('Codebook')
@Controller('codebook')
export class CodebookController {
  constructor(private readonly codebookService: CodebookService) {}

  @Get('topics')
  getTopics() {
    return this.codebookService.getTopics();
  }

  @Get('topics/:topicId/subtopics')
  getSubtopics(@Param('topicId') topicId: string) {
    return this.codebookService.getSubtopics(topicId);
  }
}
