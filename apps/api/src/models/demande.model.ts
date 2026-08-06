import { demandes } from '../drizzle/schema';
import { InferSelectModel, InferInsertModel } from 'drizzle-orm';

export const DemandeModel = demandes;
export type Demande = InferSelectModel<typeof demandes>;
export type NouvelleDemande = InferInsertModel<typeof demandes>;
