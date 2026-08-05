CREATE TYPE "public"."Role" AS ENUM('CLIENT', 'ARTISAN', 'ADMINISTRATEUR');--> statement-breakpoint
CREATE TYPE "public"."StatutDemande" AS ENUM('EN_ATTENTE', 'ACCEPTEE', 'REFUSEE', 'EN_COURS', 'TERMINEE', 'ANNULEE');--> statement-breakpoint
CREATE TYPE "public"."StatutPaiement" AS ENUM('EN_ATTENTE', 'VALIDE', 'ECHOUE', 'REMBOURSE');--> statement-breakpoint
CREATE TABLE "administrateurs" (
	"id" integer PRIMARY KEY NOT NULL
);
--> statement-breakpoint
CREATE TABLE "artisans" (
	"id" integer PRIMARY KEY NOT NULL,
	"description" text,
	"experience" integer,
	"ville" varchar(255),
	"latitude" real,
	"longitude" real,
	"disponibilite" boolean DEFAULT true NOT NULL,
	"estVerifie" boolean DEFAULT false NOT NULL,
	"noteMoyenne" real DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "avis" (
	"id" serial PRIMARY KEY NOT NULL,
	"note" integer NOT NULL,
	"commentaire" text,
	"date" timestamp DEFAULT now() NOT NULL,
	"clientId" integer NOT NULL,
	"artisanId" integer NOT NULL,
	"demandeId" integer,
	CONSTRAINT "avis_demandeId_unique" UNIQUE("demandeId")
);
--> statement-breakpoint
CREATE TABLE "categories" (
	"id" serial PRIMARY KEY NOT NULL,
	"nom" varchar(255) NOT NULL,
	CONSTRAINT "categories_nom_unique" UNIQUE("nom")
);
--> statement-breakpoint
CREATE TABLE "clients" (
	"id" integer PRIMARY KEY NOT NULL
);
--> statement-breakpoint
CREATE TABLE "demandes" (
	"id" serial PRIMARY KEY NOT NULL,
	"description" text NOT NULL,
	"adresse" text NOT NULL,
	"statut" "StatutDemande" DEFAULT 'EN_ATTENTE' NOT NULL,
	"dateCreation" timestamp DEFAULT now() NOT NULL,
	"clientId" integer NOT NULL,
	"serviceArtisanId" integer NOT NULL,
	"artisanId" integer
);
--> statement-breakpoint
CREATE TABLE "messages" (
	"id" serial PRIMARY KEY NOT NULL,
	"contenu" text NOT NULL,
	"dateCreation" timestamp DEFAULT now() NOT NULL,
	"demandeId" integer NOT NULL,
	"expediteurId" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "paiements" (
	"id" serial PRIMARY KEY NOT NULL,
	"montant" real NOT NULL,
	"methode" varchar(100) NOT NULL,
	"statut" "StatutPaiement" DEFAULT 'EN_ATTENTE' NOT NULL,
	"datePaiement" timestamp DEFAULT now() NOT NULL,
	"demandeId" integer NOT NULL,
	CONSTRAINT "paiements_demandeId_unique" UNIQUE("demandeId")
);
--> statement-breakpoint
CREATE TABLE "services" (
	"id" serial PRIMARY KEY NOT NULL,
	"nom" varchar(255) NOT NULL,
	"description" text,
	"categorieId" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "services_artisans" (
	"id" serial PRIMARY KEY NOT NULL,
	"prix" real NOT NULL,
	"artisanId" integer NOT NULL,
	"serviceId" integer NOT NULL,
	CONSTRAINT "services_artisans_artisanId_serviceId_unique" UNIQUE("artisanId","serviceId")
);
--> statement-breakpoint
CREATE TABLE "utilisateurs" (
	"id" serial PRIMARY KEY NOT NULL,
	"nom" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"motDePasse" text NOT NULL,
	"telephone" varchar(50),
	"role" "Role" NOT NULL,
	"dateCreation" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "utilisateurs_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "administrateurs" ADD CONSTRAINT "administrateurs_id_utilisateurs_id_fk" FOREIGN KEY ("id") REFERENCES "public"."utilisateurs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "artisans" ADD CONSTRAINT "artisans_id_utilisateurs_id_fk" FOREIGN KEY ("id") REFERENCES "public"."utilisateurs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "avis" ADD CONSTRAINT "avis_clientId_clients_id_fk" FOREIGN KEY ("clientId") REFERENCES "public"."clients"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "avis" ADD CONSTRAINT "avis_artisanId_artisans_id_fk" FOREIGN KEY ("artisanId") REFERENCES "public"."artisans"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "avis" ADD CONSTRAINT "avis_demandeId_demandes_id_fk" FOREIGN KEY ("demandeId") REFERENCES "public"."demandes"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "clients" ADD CONSTRAINT "clients_id_utilisateurs_id_fk" FOREIGN KEY ("id") REFERENCES "public"."utilisateurs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "demandes" ADD CONSTRAINT "demandes_clientId_clients_id_fk" FOREIGN KEY ("clientId") REFERENCES "public"."clients"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "demandes" ADD CONSTRAINT "demandes_serviceArtisanId_services_artisans_id_fk" FOREIGN KEY ("serviceArtisanId") REFERENCES "public"."services_artisans"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "demandes" ADD CONSTRAINT "demandes_artisanId_artisans_id_fk" FOREIGN KEY ("artisanId") REFERENCES "public"."artisans"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_demandeId_demandes_id_fk" FOREIGN KEY ("demandeId") REFERENCES "public"."demandes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_expediteurId_utilisateurs_id_fk" FOREIGN KEY ("expediteurId") REFERENCES "public"."utilisateurs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "paiements" ADD CONSTRAINT "paiements_demandeId_demandes_id_fk" FOREIGN KEY ("demandeId") REFERENCES "public"."demandes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "services" ADD CONSTRAINT "services_categorieId_categories_id_fk" FOREIGN KEY ("categorieId") REFERENCES "public"."categories"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "services_artisans" ADD CONSTRAINT "services_artisans_artisanId_artisans_id_fk" FOREIGN KEY ("artisanId") REFERENCES "public"."artisans"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "services_artisans" ADD CONSTRAINT "services_artisans_serviceId_services_id_fk" FOREIGN KEY ("serviceId") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;