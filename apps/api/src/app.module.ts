import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { CategoriesModule } from './modules/categories.module';
import { ServicesModule } from './modules/services.module';
import { ServicesArtisansModule } from './modules/services-artisans.module';
import { DemandesModule } from './modules/demandes.module';
import { MessagesModule } from './modules/messages.module';
import { AvisModule } from './modules/avis.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    UsersModule,
    CategoriesModule,
    ServicesModule,
    ServicesArtisansModule,
    DemandesModule,
    MessagesModule,
    AvisModule,
  ],
})
export class AppModule {}