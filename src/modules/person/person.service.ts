import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, TreeRepository } from 'typeorm';
import { Person, PersonStatus } from './entities/person.entity';
import { UserFollow } from './entities/user-follow.entity';
import { CreatePersonDto } from './dto/create-person.dto';
import { UpdatePersonDto } from './dto/update-person.dto';
import { UpdateAggregatedProfileDto } from './dto/update-aggregated-profile.dto';

@Injectable()
export class PersonService {
  constructor(
    @InjectRepository(Person)
    private personRepository: Repository<Person>,
    @InjectRepository(UserFollow)
    private userFollowRepository: Repository<UserFollow>,
  ) {}

  async create(createPersonDto: CreatePersonDto): Promise<Person> {
    const person = this.personRepository.create(createPersonDto);
    return this.personRepository.save(person);
  }

  async findAll(
    status?: PersonStatus,
    role?: string,
  ): Promise<Person[]> {
    const where: any = {};
    if (status) where.status = status;
    if (role) where.political_role = role;
    
    return this.personRepository.find({
      where,
      order: { created_at: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Person> {
    const person = await this.personRepository.findOne({
      where: { id },
      relations: ['statements', 'scores'],
    });
    if (!person) {
      throw new NotFoundException(`Person with ID ${id} not found`);
    }
    return person;
  }

  async findByName(fullName: string): Promise<Person[]> {
    return this.personRepository.find({
      where: { full_name: fullName },
    });
  }

  async update(id: number, updatePersonDto: UpdatePersonDto): Promise<Person> {
    await this.personRepository.update(id, updatePersonDto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.personRepository.delete(id);
  }

  async updateAggregatedProfile(
    id: number,
    profileDto: UpdateAggregatedProfileDto,
  ): Promise<Person> {
    const updateData: any = {
      aggregated_profile: profileDto as unknown as Record<string, any>,
    };
    if (profileDto.truth_score !== undefined) updateData.truth_score = profileDto.truth_score;
    if (profileDto.stability_score !== undefined) updateData.stability_score = profileDto.stability_score;
    if (profileDto.clarity_score !== undefined) updateData.clarity_score = profileDto.clarity_score;
    if (profileDto.populism_score !== undefined) updateData.populism_score = profileDto.populism_score;
    if (profileDto.promise_completion_rate !== undefined) updateData.promise_completion_rate = profileDto.promise_completion_rate;
    if (profileDto.total_statements !== undefined) updateData.total_statements = profileDto.total_statements;
    if (profileDto.total_promises !== undefined) updateData.total_promises = profileDto.total_promises;
    if (profileDto.fulfilled_promises !== undefined) updateData.fulfilled_promises = profileDto.fulfilled_promises;
    
    await this.personRepository.update(id, updateData);
    return this.findOne(id);
  }

  async followPerson(userId: number, personId: number): Promise<UserFollow> {
    const follow = this.userFollowRepository.create({
      user_id: userId,
      person_id: personId,
    });
    return this.userFollowRepository.save(follow);
  }

  async unfollowPerson(userId: number, personId: number): Promise<void> {
    await this.userFollowRepository.delete({
      user_id: userId,
      person_id: personId,
    });
  }

  async getFollowedPersons(userId: number): Promise<Person[]> {
    const follows = await this.userFollowRepository.find({
      where: { user_id: userId },
      relations: ['person'],
    });
    return follows.map((f) => f.person);
  }

  async searchPersons(query: string): Promise<Person[]> {
    return this.personRepository
      .createQueryBuilder('person')
      .where('person.full_name ILIKE :query', { query: `%${query}%` })
      .orWhere('person.biography ILIKE :query', { query: `%${query}%` })
      .getMany();
  }

  async incrementStatementCount(personId: number): Promise<void> {
    await this.personRepository.increment(
      { id: personId },
      'total_statements',
      1,
    );
  }
}
