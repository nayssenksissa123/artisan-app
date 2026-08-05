import { Injectable, NotFoundException } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { db } from '../drizzle/db';
import { utilisateurs, clients, artisans, administrateurs } from '../drizzle/schema';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class UsersService {
  async getProfil(userId: number) {
    const utilisateur = await db.query.utilisateurs.findFirst({
      where: eq(utilisateurs.id, userId),
      columns: {
        id: true,
        nom: true,
        email: true,
        telephone: true,
        role: true,
        dateCreation: true,
      },
      with: {
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
    const updateData: Record<string, any> = {};
    if (dto.nom) updateData.nom = dto.nom;
    if (dto.telephone) updateData.telephone = dto.telephone;

    if (Object.keys(updateData).length > 0) {
      await db.update(utilisateurs).set(updateData).where(eq(utilisateurs.id, userId));
    }

    const estArtisan = await db.query.artisans.findFirst({
      where: eq(artisans.id, userId),
    });

    if (estArtisan) {
      const artisanUpdateData: Record<string, any> = {};
      if (dto.description !== undefined) artisanUpdateData.description = dto.description;
      if (dto.experience !== undefined) artisanUpdateData.experience = dto.experience;
      if (dto.ville !== undefined) artisanUpdateData.ville = dto.ville;
      if (dto.latitude !== undefined) artisanUpdateData.latitude = dto.latitude;
      if (dto.longitude !== undefined) artisanUpdateData.longitude = dto.longitude;
      if (dto.disponibilite !== undefined) artisanUpdateData.disponibilite = dto.disponibilite;

      if (Object.keys(artisanUpdateData).length > 0) {
        await db.update(artisans).set(artisanUpdateData).where(eq(artisans.id, userId));
      }
    }

    return this.getProfil(userId);
  }
}