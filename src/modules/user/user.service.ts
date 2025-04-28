import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { userCreateDto } from './user.dto';
import { UtilsService } from '../../libs/utils/utils.service';
import { AuthService } from '../auth/auth.service';

const utilsService = new UtilsService();

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private readonly authService: AuthService,
  ) {}

  async getById(id: number) {
    return await this.userRepository.findOne({
      where: { id },
    });
  }

  async getByPhoneNumber(phone: string) {
    return await this.userRepository.find({
      where: { phone },
    });
  }

  async getToken(id: number) {
    const user = await this.getById(id);
    if (user === null) {
      return utilsService.throwError('User not found', 404);
    }

    return this.authService.generateToken(user);
  }

  async create(data: userCreateDto) {
    // Create a new user
    const { phone } = data;

    if ((await this.getByPhoneNumber(phone)) !== null) {
      utilsService.throwError('User exists');
    }

    const user = this.userRepository.create(data);

    // Save the user to the database
    return await this.userRepository.save(user);
  }
}
