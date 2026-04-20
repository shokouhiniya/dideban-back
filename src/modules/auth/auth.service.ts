import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { User } from './entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async signIn(email: string, password: string) {
    const user = await this.userRepository.findOne({ where: { email } });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // TODO: Add proper password hashing (bcrypt)
    if (user.password !== password) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { sub: user.id, email: user.email, role: user.role };
    const accessToken = this.jwtService.sign(payload);

    return { accessToken, user: { id: user.id, email: user.email, displayName: user.displayName, role: user.role } };
  }

  async signUp(email: string, password: string, displayName: string) {
    const existing = await this.userRepository.findOne({ where: { email } });
    if (existing) {
      throw new UnauthorizedException('Email already exists');
    }

    // TODO: Hash password with bcrypt
    const user = this.userRepository.create({ email, password, displayName });
    await this.userRepository.save(user);

    const payload = { sub: user.id, email: user.email, role: user.role };
    const accessToken = this.jwtService.sign(payload);

    return { accessToken, user: { id: user.id, email: user.email, displayName: user.displayName, role: user.role } };
  }

  async getMe(userId: string) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    return { id: user.id, email: user.email, displayName: user.displayName, role: user.role };
  }
}
