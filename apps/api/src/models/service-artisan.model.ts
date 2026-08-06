import { servicesArtisans } from '../drizzle/schema';
import { InferSelectModel, InferInsertModel } from 'drizzle-orm';

export const ServiceArtisanModel = servicesArtisans;
export type ServiceArtisan = InferSelectModel<typeof servicesArtisans>;
export type NouveauServiceArtisan = InferInsertModel<typeof servicesArtisans>;
