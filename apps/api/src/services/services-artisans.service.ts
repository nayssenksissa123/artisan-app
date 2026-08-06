import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { eq, and } from 'drizzle-orm';
import { db } from '../drizzle/db';
import { ServiceArtisanModel } from '../models/service-artisan.model';
import { CreateServiceArtisanDto } from '../dto/create-service-artisan.dto';

@Injectable()
export class ServicesArtisansService {
  async findAll() {
    return db.query.servicesArtisans.findMany();
  }

  async findOne(id: number) {
    const item = await db.query.servicesArtisans.findFirst({
      where: eq(ServiceArtisanModel.id, id),
    });
    if (!item) {
      throw new NotFoundException('Offre de service introuvable.');
    }
    return item;
  }

  async findByArtisan(artisanId: number) {
    return db.query.servicesArtisans.findMany({
      where: eq(ServiceArtisanModel.artisanId, artisanId),
    });
  }

  async create(dto: CreateServiceArtisanDto) {
    const existant = await db.query.servicesArtisans.findFirst({
      where: and(
        eq(ServiceArtisanModel.artisanId, dto.artisanId),
        eq(ServiceArtisanModel.serviceId, dto.serviceId),
      ),
    });
    if (existant) {
      throw new ConflictException('Cet artisan propose déjà ce service.');
    }
    const [nouveau] = await db.insert(ServiceArtisanModel).values(dto).returning();
    return nouveau;
  }

  async update(id: number, dto: Partial<CreateServiceArtisanDto>) {
    await this.findOne(id);
    const [maj] = await db
      .update(ServiceArtisanModel)
      .set(dto)
      .where(eq(ServiceArtisanModel.id, id))
      .returning();
    return maj;
  }

  async remove(id: number) {
    await this.findOne(id);
    await db.delete(ServiceArtisanModel).where(eq(ServiceArtisanModel.id, id));
    return { message: 'Offre de service supprimée.' };
  }
}
