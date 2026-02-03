import {
  Body,
  Controller,
  Get,
  Post,
  Request,
  Res,
  UnauthorizedException,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { LogoutDto } from './dto/logout.dto';
import { RefreshDto } from './dto/refresh.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { AuthGuard } from '@nestjs/passport';
import type { Request as ExpressRequest } from 'express';
import type { Response } from 'express';

@Controller('v1/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @UsePipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  )
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  @UsePipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  )
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post('refresh')
  @UsePipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  )
  refresh(@Body() dto: RefreshDto, @Request() req: ExpressRequest & { cookies?: Record<string, string> }) {
    const cookieName = process.env.AUTH_REFRESH_COOKIE_NAME ?? 'refresh_token';
    const token = dto.refreshToken ?? req.cookies?.[cookieName];

    if (!token) {
      throw new UnauthorizedException('Unauthorized');
    }

    return this.authService.refresh(token);
  }

  @Post('logout')
  @UsePipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  )
  logout(@Body() dto: LogoutDto, @Request() req: ExpressRequest & { cookies?: Record<string, string> }) {
    const cookieName = process.env.AUTH_REFRESH_COOKIE_NAME ?? 'refresh_token';
    const token = dto.refreshToken ?? req.cookies?.[cookieName];

    if (!token) {
      throw new UnauthorizedException('Unauthorized');
    }

    return this.authService.logout(token);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  me(@Request() req: ExpressRequest & { user?: { userId: string; email: string } }) {
    if (!req.user) {
      throw new UnauthorizedException('Unauthorized');
    }
    return {
      id: req.user.userId,
      email: req.user.email,
    };
  }

  @Get('google')
  @UseGuards(AuthGuard('google'))
  googleAuth() {
    return;
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleCallback(
    @Request() req: ExpressRequest & { user?: { provider: 'google'; providerId: string; email: string } },
    @Res() res: Response,
  ) {
    if (!req.user) {
      throw new UnauthorizedException('Unauthorized');
    }

    const { accessToken, refreshToken } = await this.authService.loginWithOAuth({
      provider: req.user.provider,
      providerId: req.user.providerId,
      email: req.user.email,
    });

    const cookieName = process.env.AUTH_REFRESH_COOKIE_NAME ?? 'refresh_token';
    res.cookie(cookieName, refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/v1/auth',
    });

    const redirectBase = process.env.FRONTEND_URL ?? 'http://localhost:5173';
    const redirectUrl = `${redirectBase}/oauth/callback#access_token=${encodeURIComponent(accessToken)}`;
    return res.redirect(redirectUrl);
  }

  @Get('github')
  @UseGuards(AuthGuard('github'))
  githubAuth() {
    return;
  }

  @Get('github/callback')
  @UseGuards(AuthGuard('github'))
  async githubCallback(
    @Request() req: ExpressRequest & { user?: { provider: 'github'; providerId: string; email: string } },
    @Res() res: Response,
  ) {
    if (!req.user) {
      throw new UnauthorizedException('Unauthorized');
    }

    const { accessToken, refreshToken } = await this.authService.loginWithOAuth({
      provider: req.user.provider,
      providerId: req.user.providerId,
      email: req.user.email,
    });

    const cookieName = process.env.AUTH_REFRESH_COOKIE_NAME ?? 'refresh_token';
    res.cookie(cookieName, refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/v1/auth',
    });

    const redirectBase = process.env.FRONTEND_URL ?? 'http://localhost:5173';
    const redirectUrl = `${redirectBase}/oauth/callback#access_token=${encodeURIComponent(accessToken)}`;
    return res.redirect(redirectUrl);
  }
}
