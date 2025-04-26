import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto } from './auth.dto';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post()
  login(@Body() loginDto: LoginDto): string {
    return this.authService.login(loginDto);
  }

  @Post()
  register(@Body() register: RegisterDto): string {
    return this.authService.register(register);
  }
}
