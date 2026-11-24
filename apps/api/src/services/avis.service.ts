import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { db } from '../drizzle/db';
import { AvisModel } from '../models/avis.model';
import { CreateAvisDto } from '../dto/create-avis.dto';

@Injectable()
export class AvisService {
  async findAll() {
    return db.query.avis.findMany();
  }

  async findOne(id: number) {
    const item = await db.query.avis.findFirst({
      where: eq(AvisModel.id, id),
    });
    if (!item) {
      throw new NotFoundException('Avis introuvable.');
    }
    return item;
  }

  async findByArtisan(artisanId: number) {
    return db.query.avis.findMany({
      where: eq(AvisModel.artisanId, artisanId),
      with: {
        client: {
          with: {
            utilisateur: true,
          },
        },
      },
    });
  }

  async create(dto: CreateAvisDto) {
    const existant = await db.query.avis.findFirst({
      where: eq(AvisModel.demandeId, dto.demandeId),
    });
    if (existant) {
      throw new ConflictException('Un avis existe déjà pour cette demande.');
    }
    const [nouveau] = await db.insert(AvisModel).values(dto).returning();
    return nouveau;
  }

  async remove(id: number) {
    await this.findOne(id);
    await db.delete(AvisModel).where(eq(AvisModel.id, id));
    return { message: 'Avis supprimé.' };
  }
}
