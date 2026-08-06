import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { db } from '../drizzle/db';
import { DemandeModel } from '../models/demande.model';
import { CreateDemandeDto, UpdateStatutDemandeDto } from '../dto/create-demande.dto';

@Injectable()
export class DemandesService {
  async findAll() {
    return db.query.demandes.findMany();
  }

  async findOne(id: number) {
    const demande = await db.query.demandes.findFirst({
      where: eq(DemandeModel.id, id),
    });
    if (!demande) {
      throw new NotFoundException('Demande introuvable.');
    }
    return demande;
  }

  async findByClient(clientId: number) {
    return db.query.demandes.findMany({
      where: eq(DemandeModel.clientId, clientId),
    });
  }

  async findByArtisan(artisanId: number) {
    return db.query.demandes.findMany({
      where: eq(DemandeModel.artisanId, artisanId),
    });
  }

  async create(dto: CreateDemandeDto) {
    const serviceArtisan = await db.query.servicesArtisans.findFirst({
      where: eq(DemandeModel.serviceArtisanId, dto.serviceArtisanId),
    });

    const [nouvelle] = await db.insert(DemandeModel).values(dto).returning();
    return nouvelle;
  }

  async updateStatut(id: number, dto: UpdateStatutDemandeDto) {
    const demande = await this.findOne(id);

    if (dto.statut === 'ACCEPTEE' && !dto.artisanId) {
      throw new ForbiddenException('artisanId requis pour accepter une demande.');
    }

    const updateData: Record<string, any> = { statut: dto.statut };
    if (dto.artisanId) {
      updateData.artisanId = dto.artisanId;
    }

    const [maj] = await db
      .update(DemandeModel)
      .set(updateData)
      .where(eq(DemandeModel.id, id))
      .returning();
    return maj;
  }

  async annuler(id: number) {
    await this.findOne(id);
    const [maj] = await db
      .update(DemandeModel)
      .set({ statut: 'ANNULEE' })
      .where(eq(DemandeModel.id, id))
      .returning();
    return maj;
  }
}
