import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseIntPipe,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ScoreService } from './score.service';
import { CreateScoreDto } from './dto/create-score.dto';
import { UpdateScoreDto } from './dto/update-score.dto';
import { ScoreStatus } from './entities/score.entity';
import { AuthGuard } from '../auth/auth.guard';

@Controller('scores')
export class ScoreController {
  constructor(private readonly scoreService: ScoreService) {}

  @Post()
  @UseGuards(AuthGuard)
  create(@Body() createScoreDto: CreateScoreDto) {
    return this.scoreService.create(createScoreDto);
  }

  @Get()
  findAll(
    @Query('person_id') personId?: number,
    @Query('topic_id') topicId?: number,
    @Query('status') status?: ScoreStatus,
  ) {
    return this.scoreService.findAll(personId, topicId, status);
  }

  @Get('person/:personId/topic/:topicId')
  getByPersonAndTopic(
    @Param('personId', ParseIntPipe) personId: number,
    @Param('topicId', ParseIntPipe) topicId: number,
  ) {
    return this.scoreService.getScoresByPersonAndTopic(personId, topicId);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.scoreService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateScoreDto: UpdateScoreDto,
  ) {
    return this.scoreService.update(id, updateScoreDto);
  }

  @Post(':id/verify')
  @UseGuards(AuthGuard)
  verify(
    @Param('id', ParseIntPipe) id: number,
    @Body('new_score') newScore: number,
    @Body('notes') notes: string,
    @Request() req,
  ) {
    return this.scoreService.verifyScore(id, req.user.userId, newScore, notes);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.scoreService.remove(id);
  }
}
