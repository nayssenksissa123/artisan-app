import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { db } from '../drizzle/db';
import { CategorieModel } from '../models/categorie.model';
import { CreateCategorieDto } from '../dto/create-categorie.dto';

@Injectable()
export class CategoriesService {
  async findAll() {
    return db.query.categories.findMany();
  }

  async findOne(id: number) {
    const categorie = await db.query.categories.findFirst({
      where: eq(CategorieModel.id, id),
    });
    if (!categorie) {
      throw new NotFoundException('Catégorie introuvable.');
    }
    return categorie;
  }

  async create(dto: CreateCategorieDto) {
    const existante = await db.query.categories.findFirst({
      where: eq(CategorieModel.nom, dto.nom),
    });
    if (existante) {
      throw new ConflictException('Cette catégorie existe déjà.');
    }
    const [nouvelle] = await db.insert(CategorieModel).values(dto).returning();
    return nouvelle;
  }

  async update(id: number, dto: CreateCategorieDto) {
    await this.findOne(id);
    const [maj] = await db
      .update(CategorieModel)
      .set(dto)
      .where(eq(CategorieModel.id, id))
      .returning();
    return maj;
  }

  async remove(id: number) {
    await this.findOne(id);
    await db.delete(CategorieModel).where(eq(CategorieModel.id, id));
    return { message: 'Catégorie supprimée.' };
  }
}