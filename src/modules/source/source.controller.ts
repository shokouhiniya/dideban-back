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
import { SourceService } from './source.service';
import { CreateSourceDto } from './dto/create-source.dto';
import { UpdateSourceDto } from './dto/update-source.dto';
import { SourceCredibility, VerificationLine } from './entities/source.entity';
import { AuthGuard } from '../auth/auth.guard';

@Controller('sources')
export class SourceController {
  constructor(private readonly sourceService: SourceService) {}

  @Post()
  @UseGuards(AuthGuard)
  create(@Body() createSourceDto: CreateSourceDto) {
    return this.sourceService.create(createSourceDto);
  }

  @Get()
  findAll(
    @Query('credibility') credibility?: SourceCredibility,
    @Query('verification_line') verificationLine?: VerificationLine,
  ) {
    return this.sourceService.findAll(credibility, verificationLine);
  }

  @Get('pending')
  @UseGuards(AuthGuard)
  getPending() {
    return this.sourceService.getPendingVerifications();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.sourceService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateSourceDto: UpdateSourceDto,
  ) {
    return this.sourceService.update(id, updateSourceDto);
  }

  @Post(':id/verify')
  @UseGuards(AuthGuard)
  verify(
    @Param('id', ParseIntPipe) id: number,
    @Body('credibility') credibility: SourceCredibility,
    @Request() req,
  ) {
    return this.sourceService.verifySource(id, req.user.userId, credibility);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.sourceService.remove(id);
  }
}
