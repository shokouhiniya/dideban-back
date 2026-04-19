import {
  Controller,
  Post,
  Get,
  Param,
  ParseIntPipe,
  UseGuards,
  Query,
} from '@nestjs/common';
import { AiService } from './ai.service';
import { AuthGuard } from '../auth/auth.guard';

@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('analyze/:statementId')
  @UseGuards(AuthGuard)
  async analyzeStatement(
    @Param('statementId', ParseIntPipe) statementId: number,
  ) {
    await this.aiService.analyzeStatement(statementId);
    return { message: 'Analysis completed' };
  }

  @Get('contradictions/:personId')
  @UseGuards(AuthGuard)
  async detectContradictions(
    @Param('personId', ParseIntPipe) personId: number,
  ) {
    const contradictions = await this.aiService.detectContradictions(personId);
    return { contradictions };
  }

  @Get('personality/:personId')
  @UseGuards(AuthGuard)
  async getPersonalityRadar(
    @Param('personId', ParseIntPipe) personId: number,
  ) {
    // This would fetch statements and calculate radar
    return { message: 'Personality analysis endpoint' };
  }
}
