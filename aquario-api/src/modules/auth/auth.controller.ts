import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  ValidationPipe,
} from '@nestjs/common';
import { AuthService } from './application/auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ResendVerificationDto } from './dto/resend-verification.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body() body: RegisterDto) {
    return this.authService.register(body);
  }

  @Post('login')
  login(@Body() body: LoginDto) {
    return this.authService.login(body);
  }

  @Get('verify-email')
  verifyEmailFromQuery(@Query('token') token: string) {
    return this.authService.verifyEmail(token);
  }

  @Post('verify-email')
  verifyEmailFromBody(
    @Body(new ValidationPipe({ whitelist: true })) body: VerifyEmailDto,
  ) {
    return this.authService.verifyEmail(body.token);
  }

  @Post('resend-verification')
  resendVerification(
    @Body(new ValidationPipe({ whitelist: true })) body: ResendVerificationDto,
  ) {
    return this.authService.resendVerificationEmail(body.email);
  }

  @Post('forgot-password')
  forgotPassword(@Body() body: ForgotPasswordDto) {
    return this.authService.requestPasswordReset(body.email);
  }

  @Post('reset-password')
  resetPassword(@Body() body: ResetPasswordDto) {
    return this.authService.resetPassword(body.token, body.password);
  }
}
