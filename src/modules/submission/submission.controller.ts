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
import { SubmissionService } from './submission.service';
import { CreateSubmissionDto } from './dto/create-submission.dto';
import { UpdateSubmissionDto } from './dto/update-submission.dto';
import { SubmissionStatus, VerificationTier } from './entities/submission.entity';
import { AuthGuard } from '../auth/auth.guard';

@Controller('submissions')
export class SubmissionController {
  constructor(private readonly submissionService: SubmissionService) {}

  @Post()
  @UseGuards(AuthGuard)
  create(@Body() createSubmissionDto: CreateSubmissionDto, @Request() req) {
    const data: any = {
      ...createSubmissionDto,
      submitted_by: req.user.userId,
    };
    return this.submissionService.create(data);
  }

  @Get()
  @UseGuards(AuthGuard)
  findAll(
    @Query('status') status?: SubmissionStatus,
    @Query('tier') tier?: VerificationTier,
  ) {
    return this.submissionService.findAll(status, tier);
  }

  @Get('my-submissions')
  @UseGuards(AuthGuard)
  getMySubmissions(@Request() req) {
    return this.submissionService.findAll().then(subs => 
      subs.filter(s => s.submitted_by === req.user.userId)
    );
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.submissionService.findOne(id);
  }

  @Post(':id/vote')
  @UseGuards(AuthGuard)
  vote(
    @Param('id', ParseIntPipe) id: number,
    @Body('is_upvote') isUpvote: boolean,
    @Request() req,
  ) {
    return this.submissionService.vote(id, req.user.userId, isUpvote);
  }

  @Post(':id/approve')
  @UseGuards(AuthGuard)
  approve(
    @Param('id', ParseIntPipe) id: number,
    @Request() req,
    @Body('source_id') sourceId?: number,
    @Body('statement_id') statementId?: number,
  ) {
    return this.submissionService.approve(id, req.user.userId, sourceId, statementId);
  }

  @Post(':id/reject')
  @UseGuards(AuthGuard)
  reject(
    @Param('id', ParseIntPipe) id: number,
    @Request() req,
    @Body('notes') notes?: string,
  ) {
    return this.submissionService.reject(id, req.user.userId, notes);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.submissionService.remove(id);
  }
}
