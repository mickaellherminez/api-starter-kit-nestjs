import { ConflictException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { PrismaService } from '../../prisma/prisma.service';
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

    const accessToken = await this.signAccessToken(user.id, user.email);
    const refreshToken = await this.signRefreshToken(user.id, user.email);

    return { accessToken, refreshToken };
  }

  private signAccessToken(userId: string, email: string) {
    const secret = process.env.JWT_ACCESS_SECRET ?? 'dev-access-secret';
    const expiresIn = process.env.JWT_ACCESS_EXPIRES_IN ?? '15m';
    return this.jwt.signAsync({ sub: userId, email }, { secret, expiresIn });
  }

  private signRefreshToken(userId: string, email: string) {
    const secret = process.env.JWT_REFRESH_SECRET ?? 'dev-refresh-secret';
    const expiresIn = process.env.JWT_REFRESH_EXPIRES_IN ?? '7d';
    return this.jwt.signAsync({ sub: userId, email }, { secret, expiresIn });
  }
}
