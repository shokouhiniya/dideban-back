import { Controller, Get, Post, Param, Body, Query, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

import { VerificationService } from './verification.service';
import { ReviewVerdict } from './entities/verification-review.entity';

@ApiTags('Verification')
@Controller('verification')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
export class VerificationController {
  constructor(private readonly verificationService: VerificationService) {}

  @Get('queue')
  getQueue(
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ) {
    return this.verificationService.getQueue({ limit, offset });
  }

  @Post(':id/review')
  submitReview(
    @Param('id') id: string,
    @Request() req,
    @Body() body: { verdict: ReviewVerdict; reason?: string; overrideScore?: number },
  ) {
    return this.verificationService.submitReview({
      submissionId: id,
      reviewerId: req.user.id,
      ...body,
    });
  }

  @Get('conflicts')
  getConflicts() {
    return this.verificationService.getConflicts();
  }

  @Get('activity-log')
  getActivityLog(
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ) {
    return this.verificationService.getActivityLog({ limit, offset });
  }
}
