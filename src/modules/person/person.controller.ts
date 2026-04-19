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
import { PersonService } from './person.service';
import { CreatePersonDto } from './dto/create-person.dto';
import { UpdatePersonDto } from './dto/update-person.dto';
import { UpdateAggregatedProfileDto } from './dto/update-aggregated-profile.dto';
import { PersonStatus } from './entities/person.entity';
import { AuthGuard } from '../auth/auth.guard';

@Controller('persons')
export class PersonController {
  constructor(private readonly personService: PersonService) {}

  @Post()
  @UseGuards(AuthGuard)
  create(@Body() createPersonDto: CreatePersonDto) {
    return this.personService.create(createPersonDto);
  }

  @Get()
  findAll(
    @Query('status') status?: PersonStatus,
    @Query('role') role?: string,
  ) {
    return this.personService.findAll(status, role);
  }

  @Get('search')
  search(@Query('q') query: string) {
    return this.personService.searchPersons(query);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.personService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePersonDto: UpdatePersonDto,
  ) {
    return this.personService.update(id, updatePersonDto);
  }

  @Patch(':id/profile')
  @UseGuards(AuthGuard)
  updateProfile(
    @Param('id', ParseIntPipe) id: number,
    @Body() profileDto: UpdateAggregatedProfileDto,
  ) {
    return this.personService.updateAggregatedProfile(id, profileDto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.personService.remove(id);
  }

  @Post(':id/follow')
  @UseGuards(AuthGuard)
  follow(
    @Param('id', ParseIntPipe) personId: number,
    @Request() req,
  ) {
    return this.personService.followPerson(req.user.userId, personId);
  }

  @Delete(':id/follow')
  @UseGuards(AuthGuard)
  unfollow(
    @Param('id', ParseIntPipe) personId: number,
    @Request() req,
  ) {
    return this.personService.unfollowPerson(req.user.userId, personId);
  }

  @Get('user/followed')
  @UseGuards(AuthGuard)
  getFollowed(@Request() req) {
    return this.personService.getFollowedPersons(req.user.userId);
  }
}
