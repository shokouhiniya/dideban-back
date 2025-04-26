import { Injectable } from '@nestjs/common';
import { LoginDto, RegisterDto } from './auth.dto';

@Injectable()
export class AuthService {
  login(loginDto: LoginDto): string {
    console.log(loginDto);

    return 'Login';
  }

  register(registerDto: RegisterDto): string {
    console.log(registerDto);

    return 'register';
  }
}
