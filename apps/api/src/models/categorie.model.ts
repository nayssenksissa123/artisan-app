import { categories } from '../drizzle/schema';
import { InferSelectModel, InferInsertModel } from 'drizzle-orm';

export const CategorieModel = categories;
export type Categorie = InferSelectModel<typeof categories>;
export type NouvelleCategorie = InferInsertModel<typeof categories>;