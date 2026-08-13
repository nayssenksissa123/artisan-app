import { avis } from '../drizzle/schema';
import { InferSelectModel, InferInsertModel } from 'drizzle-orm';

export const AvisModel = avis;
export type Avis = InferSelectModel<typeof avis>;
export type NouvelAvis = InferInsertModel<typeof avis>;
