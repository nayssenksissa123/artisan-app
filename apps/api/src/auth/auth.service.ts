import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { eq } from 'drizzle-orm';
import { db } from '../drizzle/db';
import { utilisateurs, clients, artisans } from '../drizzle/schema';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  async register(dto: RegisterDto) {
    const existant = await db.query.utilisateurs.findFirst({
      where: eq(utilisateurs.email, dto.email),
    });
    if (existant) {
      throw new ConflictException('Un compte existe déjà avec cet email.');
    }

    const motDePasseHash = await bcrypt.hash(dto.motDePasse, 10);

    const [utilisateur] = await db
      .insert(utilisateurs)
      .values({
        nom: dto.nom,
        email: dto.email,
        motDePasse: motDePasseHash,
        telephone: dto.telephone,
        role: dto.role,
      })
      .returning();

    if (dto.role === 'CLIENT') {
      await db.insert(clients).values({ id: utilisateur.id });
    } else if (dto.role === 'ARTISAN') {
      await db.insert(artisans).values({ id: utilisateur.id });
    }

    return this.genererToken(utilisateur.id, utilisateur.email, utilisateur.role);
  }

  async login(dto: LoginDto) {
    const utilisateur = await db.query.utilisateurs.findFirst({
      where: eq(utilisateurs.email, dto.email),
    });
    if (!utilisateur) {
      throw new UnauthorizedException('Email ou mot de passe incorrect.');
    }

    const motDePasseValide = await bcrypt.compare(dto.motDePasse, utilisateur.motDePasse);
    if (!motDePasseValide) {
      throw new UnauthorizedException('Email ou mot de passe incorrect.');
    }

    return this.genererToken(utilisateur.id, utilisateur.email, utilisateur.role);
  }

  async oauthLogin(profile: any) {
    const email = profile.emails?.[0]?.value;
    if (!email) {
      throw new UnauthorizedException('Email not provided by OAuth provider.');
    }

    let utilisateur = await db.query.utilisateurs.findFirst({
      where: eq(utilisateurs.email, email),
    });

    if (!utilisateur) {
      const nom = profile.displayName || (profile.name ? `${profile.name.givenName || ''} ${profile.name.familyName || ''}`.trim() : '');
      const randomPass = Date.now().toString() + Math.random().toString(36).slice(2);
      const motDePasseHash = await bcrypt.hash(randomPass, 10);

      const [created] = await db
        .insert(utilisateurs)
        .values({
          nom,
          email,
          motDePasse: motDePasseHash,
          telephone: null,
          role: 'CLIENT',
        })
        .returning();

      utilisateur = created;
      await db.insert(clients).values({ id: utilisateur.id });
    }

    return this.genererToken(utilisateur.id, utilisateur.email, utilisateur.role);
  }

  private genererToken(userId: number, email: string, role: string) {
    const payload = { sub: userId, email, role };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}