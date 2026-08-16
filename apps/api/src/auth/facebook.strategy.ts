import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import Strategy from 'passport-facebook';

@Injectable()
export class FacebookStrategy extends PassportStrategy(Strategy, 'facebook') {
  constructor() {
    super({
      clientID: process.env.FACEBOOK_CLIENT_ID || '',
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET || '',
      callbackURL: process.env.FACEBOOK_CALLBACK_URL || 'http://localhost:3000/auth/facebook/callback',
      profileFields: ['id', 'emails', 'name', 'picture.type(large)'],
      graphAPIVersion: 'v19.0',
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: any, done: any) {
    const user = {
      provider: 'facebook',
      providerId: profile.id,
      displayName: `${profile.name?.givenName || ''} ${profile.name?.familyName || ''}`.trim(),
      emails: profile.emails,
      photos: profile.photos,
    };
    done(null, user);
  }
}
