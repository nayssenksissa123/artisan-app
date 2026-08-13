import { Controller, Post, Body, Get, Req, Res, Next } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
// Use CommonJS require to avoid interop issues when loading passport at runtime
const passport = require('passport');
import { Request, Response, NextFunction } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('inscription')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('connexion')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  private hasGoogleConfig() {
    return !!process.env.GOOGLE_CLIENT_ID && !!process.env.GOOGLE_CLIENT_SECRET;
  }

  private hasFacebookConfig() {
    return !!process.env.FACEBOOK_CLIENT_ID && !!process.env.FACEBOOK_CLIENT_SECRET;
  }

  private async redirectToDemo(@Res() res: Response, provider: 'google' | 'facebook') {
    const email = provider === 'google' ? 'google.dev@artisan-app.local' : 'facebook.dev@artisan-app.local';
    const token = await this.authService.oauthLogin({
      displayName: `${provider === 'google' ? 'Google' : 'Facebook'} Demo`,
      emails: [{ value: email }],
    });
    const frontend = process.env.FRONTEND_URL || 'http://localhost:5173';
    return res.redirect(`${frontend}/inscription?token=${token.access_token}`);
  }

  @Get('google')
  googleAuth(@Req() req: Request, @Res() res: Response, @Next() next: NextFunction) {
    if (!this.hasGoogleConfig()) {
      return this.redirectToDemo(res, 'google');
    }

    return passport.authenticate('google', { scope: ['email', 'profile'] })(req, res, next);
  }

  @Get('google/callback')
  googleAuthRedirect(@Req() req: Request, @Res() res: Response, @Next() next: NextFunction) {
    if (!this.hasGoogleConfig()) {
      return this.redirectToDemo(res, 'google');
    }

    return passport.authenticate('google', { session: false }, async (err, user) => {
      if (err || !user) {
        const frontend = process.env.FRONTEND_URL || 'http://localhost:5173';
        return res.redirect(`${frontend}/connexion?error=oauth`);
      }
      const token = await this.authService.oauthLogin(user);
      const frontend = process.env.FRONTEND_URL || 'http://localhost:5173';
      return res.redirect(`${frontend}/inscription?token=${token.access_token}`);
    })(req, res, next);
  }

  @Get('facebook')
  facebookAuth(@Req() req: Request, @Res() res: Response, @Next() next: NextFunction) {
    if (!this.hasFacebookConfig()) {
      return this.redirectToDemo(res, 'facebook');
    }

    return passport.authenticate('facebook', { scope: ['email'] })(req, res, next);
  }

  @Get('facebook/callback')
  facebookAuthRedirect(@Req() req: Request, @Res() res: Response, @Next() next: NextFunction) {
    if (!this.hasFacebookConfig()) {
      return this.redirectToDemo(res, 'facebook');
    }

    return passport.authenticate('facebook', { session: false }, async (err, user) => {
      if (err || !user) {
        const frontend = process.env.FRONTEND_URL || 'http://localhost:5173';
        return res.redirect(`${frontend}/connexion?error=oauth`);
      }
      const token = await this.authService.oauthLogin(user);
      const frontend = process.env.FRONTEND_URL || 'http://localhost:5173';
      return res.redirect(`${frontend}/inscription?token=${token.access_token}`);
    })(req, res, next);
  }
}