import {
  pgTable,
  serial,
  text,
  varchar,
  boolean,
  integer,
  real,
  timestamp,
  pgEnum,
  unique,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// ------------------------------------------------------------
// Enums
// ------------------------------------------------------------

export const roleEnum = pgEnum('Role', ['CLIENT', 'ARTISAN', 'ADMINISTRATEUR']);
export const statutDemandeEnum = pgEnum('StatutDemande', [
  'EN_ATTENTE', 'ACCEPTEE', 'REFUSEE', 'EN_COURS', 'TERMINEE', 'ANNULEE',
]);
export const statutPaiementEnum = pgEnum('StatutPaiement', [
  'EN_ATTENTE', 'VALIDE', 'ECHOUE', 'REMBOURSE',
]);

// ------------------------------------------------------------
// Utilisateur (table de base)
// ------------------------------------------------------------

export const utilisateurs = pgTable('utilisateurs', {
  id: serial('id').primaryKey(),
  nom: varchar('nom', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  motDePasse: text('motDePasse').notNull(),
  telephone: varchar('telephone', { length: 50 }),
  role: roleEnum('role').notNull(),
  dateCreation: timestamp('dateCreation').defaultNow().notNull(),
});

export const clients = pgTable('clients', {
  id: integer('id').primaryKey().references(() => utilisateurs.id, { onDelete: 'cascade' }),
});

export const artisans = pgTable('artisans', {
  id: integer('id').primaryKey().references(() => utilisateurs.id, { onDelete: 'cascade' }),
  description: text('description'),
  experience: integer('experience'),
  ville: varchar('ville', { length: 255 }),
  latitude: real('latitude'),
  longitude: real('longitude'),
  disponibilite: boolean('disponibilite').default(true).notNull(),
  estVerifie: boolean('estVerifie').default(false).notNull(),
  noteMoyenne: real('noteMoyenne').default(0).notNull(),
});

export const administrateurs = pgTable('administrateurs', {
  id: integer('id').primaryKey().references(() => utilisateurs.id, { onDelete: 'cascade' }),
});

// ------------------------------------------------------------
// Catégories & Services
// ------------------------------------------------------------

export const categories = pgTable('categories', {
  id: serial('id').primaryKey(),
  nom: varchar('nom', { length: 255 }).notNull().unique(),
});

export const services = pgTable('services', {
  id: serial('id').primaryKey(),
  nom: varchar('nom', { length: 255 }).notNull(),
  description: text('description'),
  categorieId: integer('categorieId').notNull().references(() => categories.id, { onDelete: 'restrict' }),
});

export const servicesArtisans = pgTable('services_artisans', {
  id: serial('id').primaryKey(),
  prix: real('prix').notNull(),
  artisanId: integer('artisanId').notNull().references(() => artisans.id, { onDelete: 'cascade' }),
  serviceId: integer('serviceId').notNull().references(() => services.id, { onDelete: 'cascade' }),
}, (table) => ({
  uniqArtisanService: unique().on(table.artisanId, table.serviceId),
}));

// ------------------------------------------------------------
// Demandes
// ------------------------------------------------------------

export const demandes = pgTable('demandes', {
  id: serial('id').primaryKey(),
  description: text('description').notNull(),
  adresse: text('adresse').notNull(),
  statut: statutDemandeEnum('statut').default('EN_ATTENTE').notNull(),
  dateCreation: timestamp('dateCreation').defaultNow().notNull(),
  clientId: integer('clientId').notNull().references(() => clients.id, { onDelete: 'cascade' }),
  serviceArtisanId: integer('serviceArtisanId').notNull().references(() => servicesArtisans.id, { onDelete: 'restrict' }),
  artisanId: integer('artisanId').references(() => artisans.id, { onDelete: 'set null' }),
});

// ------------------------------------------------------------
// Messages
// ------------------------------------------------------------

export const messages = pgTable('messages', {
  id: serial('id').primaryKey(),
  contenu: text('contenu').notNull(),
  dateCreation: timestamp('dateCreation').defaultNow().notNull(),
  demandeId: integer('demandeId').notNull().references(() => demandes.id, { onDelete: 'cascade' }),
  expediteurId: integer('expediteurId').notNull().references(() => utilisateurs.id, { onDelete: 'cascade' }),
});

// ------------------------------------------------------------
// Avis
// ------------------------------------------------------------

export const avis = pgTable('avis', {
  id: serial('id').primaryKey(),
  note: integer('note').notNull(),
  commentaire: text('commentaire'),
  date: timestamp('date').defaultNow().notNull(),
  clientId: integer('clientId').notNull().references(() => clients.id, { onDelete: 'cascade' }),
  artisanId: integer('artisanId').notNull().references(() => artisans.id, { onDelete: 'cascade' }),
  demandeId: integer('demandeId').unique().references(() => demandes.id, { onDelete: 'set null' }),
});

// ------------------------------------------------------------
// Paiement
// ------------------------------------------------------------

export const paiements = pgTable('paiements', {
  id: serial('id').primaryKey(),
  montant: real('montant').notNull(),
  methode: varchar('methode', { length: 100 }).notNull(),
  statut: statutPaiementEnum('statut').default('EN_ATTENTE').notNull(),
  datePaiement: timestamp('datePaiement').defaultNow().notNull(),
  demandeId: integer('demandeId').notNull().unique().references(() => demandes.id, { onDelete: 'cascade' }),
});

// ------------------------------------------------------------
// Relations (pour les requêtes avec jointures)
// ------------------------------------------------------------

export const utilisateursRelations = relations(utilisateurs, ({ one, many }) => ({
  client: one(clients, { fields: [utilisateurs.id], references: [clients.id] }),
  artisan: one(artisans, { fields: [utilisateurs.id], references: [artisans.id] }),
  administrateur: one(administrateurs, { fields: [utilisateurs.id], references: [administrateurs.id] }),
  messages: many(messages),
}));

export const clientsRelations = relations(clients, ({ one, many }) => ({
  utilisateur: one(utilisateurs, { fields: [clients.id], references: [utilisateurs.id] }),
  demandes: many(demandes),
  avis: many(avis),
}));

export const artisansRelations = relations(artisans, ({ one, many }) => ({
  utilisateur: one(utilisateurs, { fields: [artisans.id], references: [utilisateurs.id] }),
  servicesArtisans: many(servicesArtisans),
  demandes: many(demandes),
  avis: many(avis),
}));

export const administrateursRelations = relations(administrateurs, ({ one }) => ({
  utilisateur: one(utilisateurs, { fields: [administrateurs.id], references: [utilisateurs.id] }),
}));

export const categoriesRelations = relations(categories, ({ many }) => ({
  services: many(services),
}));

export const servicesRelations = relations(services, ({ one, many }) => ({
  categorie: one(categories, { fields: [services.categorieId], references: [categories.id] }),
  servicesArtisans: many(servicesArtisans),
}));

export const servicesArtisansRelations = relations(servicesArtisans, ({ one, many }) => ({
  artisan: one(artisans, { fields: [servicesArtisans.artisanId], references: [artisans.id] }),
  service: one(services, { fields: [servicesArtisans.serviceId], references: [services.id] }),
  demandes: many(demandes),
}));

export const demandesRelations = relations(demandes, ({ one, many }) => ({
  client: one(clients, { fields: [demandes.clientId], references: [clients.id] }),
  serviceArtisan: one(servicesArtisans, { fields: [demandes.serviceArtisanId], references: [servicesArtisans.id] }),
  artisan: one(artisans, { fields: [demandes.artisanId], references: [artisans.id] }),
  messages: many(messages),
  avis: one(avis),
  paiement: one(paiements),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  demande: one(demandes, { fields: [messages.demandeId], references: [demandes.id] }),
  expediteur: one(utilisateurs, { fields: [messages.expediteurId], references: [utilisateurs.id] }),
}));

export const avisRelations = relations(avis, ({ one }) => ({
  client: one(clients, { fields: [avis.clientId], references: [clients.id] }),
  artisan: one(artisans, { fields: [avis.artisanId], references: [artisans.id] }),
  demande: one(demandes, { fields: [avis.demandeId], references: [demandes.id] }),
}));

export const paiementsRelations = relations(paiements, ({ one }) => ({
  demande: one(demandes, { fields: [paiements.demandeId], references: [demandes.id] }),
}));