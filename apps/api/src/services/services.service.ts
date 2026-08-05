import { Injectable, NotFoundException } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { db } from '../drizzle/db';
import { ServiceModel } from '../models/service.model';
import { CategorieModel } from '../models/categorie.model';
import { CreateServiceDto } from '../dto/create-service.dto';

@Injectable()
export class ServicesService {
  async findAll() {
    return db.query.services.findMany();
  }

  async findOne(id: number) {
    const service = await db.query.services.findFirst({
      where: eq(ServiceModel.id, id),
    });
    if (!service) {
      throw new NotFoundException('Service introuvable.');
    }
    return service;
  }

  async create(dto: CreateServiceDto) {
    const categorie = await db.query.categories.findFirst({
      where: eq(CategorieModel.id, dto.categorieId),
    });
    if (!categorie) {
      throw new NotFoundException('Catégorie introuvable.');
    }
    const [nouveau] = await db.insert(ServiceModel).values(dto).returning();
    return nouveau;
  }

  async update(id: number, dto: Partial<CreateServiceDto>) {
    await this.findOne(id);
    const [maj] = await db
      .update(ServiceModel)
      .set(dto)
      .where(eq(ServiceModel.id, id))
      .returning();
    return maj;
  }

  async remove(id: number) {
    await this.findOne(id);
    await db.delete(ServiceModel).where(eq(ServiceModel.id, id));
    return { message: 'Service supprimé.' };
  }
}