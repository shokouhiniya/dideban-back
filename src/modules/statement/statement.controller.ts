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
  UseGuards,
} from '@nestjs/common';
import { StatementService } from './statement.service';
import { CreateStatementDto } from './dto/create-statement.dto';
import { UpdateStatementDto } from './dto/update-statement.dto';
import { StatementStatus } from './entities/statement.entity';
import { AuthGuard } from '../auth/auth.guard';

@Controller('statements')
export class StatementController {
  constructor(private readonly statementService: StatementService) {}

  @Post()
  @UseGuards(AuthGuard)
  create(@Body() createStatementDto: CreateStatementDto) {
    return this.statementService.create(createStatementDto);
  }

  @Get()
  findAll(
    @Query('person_id') personId?: number,
    @Query('status') status?: StatementStatus,
    @Query('topic_id') topicId?: number,
  ) {
    return this.statementService.findAll(personId, status, topicId);
  }

  @Get('contradictions')
  getContradictions() {
    return this.statementService.getContradictions();
  }

  @Get('timeline/:personId')
  getTimeline(@Param('personId', ParseIntPipe) personId: number) {
    return this.statementService.getTimelineByPerson(personId);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.statementService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateStatementDto: UpdateStatementDto,
  ) {
    return this.statementService.update(id, updateStatementDto);
  }

  @Post(':id/flag-contradiction')
  @UseGuards(AuthGuard)
  flagContradiction(
    @Param('id', ParseIntPipe) id: number,
    @Body() details: Record<string, any>,
  ) {
    return this.statementService.flagContradiction(id, details);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.statementService.remove(id);
  }
}
