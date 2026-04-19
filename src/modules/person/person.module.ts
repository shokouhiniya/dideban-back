import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Person } from './entities/person.entity';
import { UserFollow } from './entities/user-follow.entity';
import { PersonService } from './person.service';
import { PersonController } from './person.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Person, UserFollow])],
  providers: [PersonService],
  controllers: [PersonController],
  exports: [PersonService],
})
export class PersonModule {}
