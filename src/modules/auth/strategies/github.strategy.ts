import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile } from 'passport-github2';

@Injectable()
export class GitHubStrategy extends PassportStrategy(Strategy, 'github') {
  constructor() {
    const clientID = process.env.GITHUB_CLIENT_ID?.trim() || 'disabled';
    const clientSecret = process.env.GITHUB_CLIENT_SECRET?.trim() || 'disabled';
    const callbackURL =
      process.env.GITHUB_CALLBACK_URL?.trim() ||
      'http://localhost:3000/v1/auth/github/callback';

    super({
      clientID,
      clientSecret,
      callbackURL,
      scope: ['user:email'],
    });
  }

  validate(_accessToken: string, _refreshToken: string, profile: Profile) {
    const email = profile.emails?.[0]?.value ?? '';

    return {
      provider: 'github' as const,
      providerId: profile.id,
      email,
    };
  }
}
