import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async getProfil(userId: number) {
    const utilisateur = await this.prisma.utilisateur.findUnique({
      where: { id: userId },
      select: {
        id: true,
        nom: true,
        email: true,
        telephone: true,
        role: true,
        dateCreation: true,
        client: true,
        artisan: true,
        administrateur: true,
      },
    });

    if (!utilisateur) {
      throw new NotFoundException('Utilisateur introuvable.');
    }

    return utilisateur;
  }

  async updateProfil(userId: number, dto: UpdateProfileDto) {
    const utilisateur = await this.prisma.utilisateur.update({
      where: { id: userId },
      data: {
        ...(dto.nom && { nom: dto.nom }),
        ...(dto.telephone && { telephone: dto.telephone }),
      },
      include: { artisan: true, client: true },
    });

    if (utilisateur.artisan) {
      await this.prisma.artisan.update({
        where: { id: userId },
        data: {
          ...(dto.description !== undefined && { description: dto.description }),
          ...(dto.experience !== undefined && { experience: dto.experience }),
          ...(dto.ville !== undefined && { ville: dto.ville }),
          ...(dto.latitude !== undefined && { latitude: dto.latitude }),
          ...(dto.longitude !== undefined && { longitude: dto.longitude }),
          ...(dto.disponibilite !== undefined && { disponibilite: dto.disponibilite }),
        },
      });
    }

    return this.getProfil(userId);
  }
}