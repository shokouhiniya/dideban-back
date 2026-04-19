import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
  ParseIntPipe,
  Request,
  UseGuards,
} from '@nestjs/common';
import { VerificationService } from './verification.service';
import { CreateVerificationDto } from './dto/create-verification.dto';
import { QueueItemStatus, QueueItemType } from './entities/verification-queue.entity';
import { AuthGuard } from '../auth/auth.guard';

@Controller('verification')
export class VerificationController {
  constructor(private readonly verificationService: VerificationService) {}

  @Post()
  @UseGuards(AuthGuard)
  create(@Body() createDto: CreateVerificationDto) {
    return this.verificationService.create(createDto);
  }

  @Get()
  @UseGuards(AuthGuard)
  findAll(
    @Query('status') status?: QueueItemStatus,
    @Query('type') itemType?: QueueItemType,
  ) {
    return this.verificationService.findAll(status, itemType);
  }

  @Get('my-tasks')
  @UseGuards(AuthGuard)
  getMyTasks(@Request() req) {
    return this.verificationService.getPendingForVerifier(req.user.userId);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.verificationService.findOne(id);
  }

  @Post(':id/assign')
  @UseGuards(AuthGuard)
  assign(
    @Param('id', ParseIntPipe) id: number,
    @Request() req,
  ) {
    return this.verificationService.assignToVerifier(id, req.user.userId);
  }

  @Post(':id/complete')
  @UseGuards(AuthGuard)
  complete(
    @Param('id', ParseIntPipe) id: number,
    @Body('verdict') verdict: string,
    @Body('details') details: Record<string, any>,
    @Request() req,
  ) {
    return this.verificationService.complete(id, req.user.userId, verdict, details);
  }
}
