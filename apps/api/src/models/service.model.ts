import { services } from '../drizzle/schema';
import { InferSelectModel, InferInsertModel } from 'drizzle-orm';

export const ServiceModel = services;
export type Service = InferSelectModel<typeof services>;
export type NouveauService = InferInsertModel<typeof services>;