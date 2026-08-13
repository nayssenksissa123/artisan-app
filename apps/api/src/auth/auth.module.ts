import { Module, Provider } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './jwt.strategy';

let optionalProviders: Provider[] = [];
try {
  const hasGoogle = !!process.env.GOOGLE_CLIENT_ID && !!process.env.GOOGLE_CLIENT_SECRET;
  const hasFacebook = !!process.env.FACEBOOK_CLIENT_ID && !!process.env.FACEBOOK_CLIENT_SECRET;
  if (hasGoogle) {
    // lazy require to avoid throwing at import time when env not set
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { GoogleStrategy } = require('./google.strategy');
    optionalProviders.push(GoogleStrategy);
  }
  if (hasFacebook) {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { FacebookStrategy } = require('./facebook.strategy');
    optionalProviders.push(FacebookStrategy);
  }
} catch (e) {
  // ignore — strategies remain absent when env not configured
}

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'change_moi_en_production',
      signOptions: { expiresIn: '7d' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, ...optionalProviders],
})
export class AuthModule {}