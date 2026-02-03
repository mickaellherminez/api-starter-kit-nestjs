import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { StringValue } from 'ms';
import { randomUUID } from 'crypto';
import * as argon2 from 'argon2';
import { PrismaService } from '../../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existing) {
      throw new ConflictException('Email already in use');
    }

    const passwordHash = await argon2.hash(dto.password);
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash,
      },
    });

    return this.issueTokens(user.id, user.email);
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isValid = await argon2.verify(user.passwordHash, dto.password);
    if (!isValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.issueTokens(user.id, user.email);
  }

  async refresh(refreshToken: string) {
    const secret = process.env.JWT_REFRESH_SECRET ?? 'dev-refresh-secret';
    let payload: unknown;
    try {
      payload = await this.jwt.verifyAsync(refreshToken, { secret });
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (!payload || typeof payload !== 'object') {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const tokenPayload = payload as { sub?: string; email?: string; jti?: string };
    if (!tokenPayload.sub || !tokenPayload.jti) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const stored = await this.prisma.refreshToken.findUnique({
      where: { id: tokenPayload.jti },
    });
    if (!stored || stored.revokedAt) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (stored.expiresAt <= new Date()) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const matches = await argon2.verify(stored.tokenHash, refreshToken);
    if (!matches) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (stored.userId !== tokenPayload.sub) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    await this.prisma.refreshToken.update({
      where: { id: stored.id },
      data: { revokedAt: new Date() },
    });

    const email =
      typeof tokenPayload.email === 'string'
        ? tokenPayload.email
        : await this.getUserEmail(tokenPayload.sub);

    return this.issueTokens(tokenPayload.sub, email);
  }

  private async issueTokens(userId: string, email: string) {
    const accessToken = await this.signAccessToken(userId, email);
    const refreshToken = await this.signRefreshToken(userId, email);
    return { accessToken, refreshToken };
  }

  private signAccessToken(userId: string, email: string) {
    const secret = process.env.JWT_ACCESS_SECRET ?? 'dev-access-secret';
    const expiresIn = (process.env.JWT_ACCESS_EXPIRES_IN ?? '15m') as StringValue;
    return this.jwt.signAsync({ sub: userId, email }, { secret, expiresIn });
  }

  private async signRefreshToken(userId: string, email: string) {
    const secret = process.env.JWT_REFRESH_SECRET ?? 'dev-refresh-secret';
    const expiresIn = (process.env.JWT_REFRESH_EXPIRES_IN ?? '7d') as StringValue;
    const tokenId = randomUUID();
    const token = await this.jwt.signAsync(
      { sub: userId, email, jti: tokenId },
      { secret, expiresIn },
    );

    const decoded = this.jwt.decode(token);
    const exp =
      decoded && typeof decoded === 'object' && 'exp' in decoded
        ? (decoded as { exp?: number }).exp
        : undefined;
    const expiresAt = exp ? new Date(exp * 1000) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const tokenHash = await argon2.hash(token);
    await this.prisma.refreshToken.create({
      data: {
        id: tokenId,
        tokenHash,
        userId,
        expiresAt,
      },
    });

    return token;
  }

  private async getUserEmail(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { email: true },
    });
    if (!user) {
      throw new UnauthorizedException('Invalid refresh token');
    }
    return user.email;
  }
}
