import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    // Vérifier que l'email n'existe pas déjà
    const existant = await this.prisma.utilisateur.findUnique({
      where: { email: dto.email },
    });
    if (existant) {
      throw new ConflictException('Un compte existe déjà avec cet email.');
    }

    // Hasher le mot de passe (jamais stocké en clair !)
    const motDePasseHash = await bcrypt.hash(dto.motDePasse, 10);

    // Créer l'utilisateur de base + son sous-type (Client ou Artisan)
    const utilisateur = await this.prisma.utilisateur.create({
      data: {
        nom: dto.nom,
        email: dto.email,
        motDePasse: motDePasseHash,
        telephone: dto.telephone,
        role: dto.role,
        ...(dto.role === 'CLIENT' && { client: { create: {} } }),
        ...(dto.role === 'ARTISAN' && { artisan: { create: {} } }),
      },
    });

    return this.genererToken(utilisateur.id, utilisateur.email, utilisateur.role);
  }

  async login(dto: LoginDto) {
    const utilisateur = await this.prisma.utilisateur.findUnique({
      where: { email: dto.email },
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

  private genererToken(userId: number, email: string, role: string) {
    const payload = { sub: userId, email, role };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}