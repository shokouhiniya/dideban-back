import {
  Controller,
  Get,
  Post,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { ProfileService } from './profile.service';
import { AuthGuard } from '../auth/auth.guard';

@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get(':personId')
  async getProfile(@Param('personId', ParseIntPipe) personId: number) {
    const profile = await this.profileService.getProfile(personId);
    return { profile };
  }

  @Post(':personId/calculate')
  @UseGuards(AuthGuard)
  async calculateProfile(@Param('personId', ParseIntPipe) personId: number) {
    const profile = await this.profileService.calculateAggregatedProfile(personId);
    return { profile };
  }

  @Post('recalculate-all')
  @UseGuards(AuthGuard)
  async recalculateAll() {
    await this.profileService.recalculateAllProfiles();
    return { message: 'All profiles recalculated' };
  }
}
