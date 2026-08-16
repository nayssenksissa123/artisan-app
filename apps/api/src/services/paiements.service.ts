import { Injectable } from '@nestjs/common';
import { db } from '../drizzle/db';
import { paiements } from '../drizzle/schema';
import { eq } from 'drizzle-orm';
import { CreatePaiementDto } from '../dto/create-paiement.dto';

@Injectable()
export class PaiementsService {
  async findAll() {
    return db.select().from(paiements);
  }

  async findOne(id: number) {
    const result = await db.select().from(paiements).where(eq(paiements.id, id));
    return result[0];
  }

  async findByDemande(demandeId: number) {
    const result = await db.select().from(paiements).where(eq(paiements.demandeId, demandeId));
    return result[0];
  }

  async create(dto: CreatePaiementDto) {
    const result = await db.insert(paiements).values(dto as any).returning();
    return result[0];
  }

  async updateStatut(id: number, statut: string) {
    const result = await db
      .update(paiements)
      .set({ statut: statut as any })
      .where(eq(paiements.id, id))
      .returning();
    return result[0];
  }
}
