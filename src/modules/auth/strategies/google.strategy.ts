import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile } from 'passport-google-oauth20';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor() {
    const clientID = process.env.GOOGLE_CLIENT_ID?.trim() || 'disabled';
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET?.trim() || 'disabled';
    const callbackURL =
      process.env.GOOGLE_CALLBACK_URL?.trim() ||
      'http://localhost:3000/v1/auth/google/callback';

    super({
      clientID,
      clientSecret,
      callbackURL,
      scope: ['email', 'profile'],
    });
  }

  validate(_accessToken: string, _refreshToken: string, profile: Profile) {
    const email = profile.emails?.[0]?.value ?? '';
    return {
      provider: 'google' as const,
      providerId: profile.id,
      email,
    };
  }
}
