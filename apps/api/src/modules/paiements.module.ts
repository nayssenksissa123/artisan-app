import { Module } from '@nestjs/common';
import { PaiementsController } from '../controllers/paiements.controller';
import { PaiementsService } from '../services/paiements.service';

@Module({
  controllers: [PaiementsController],
  providers: [PaiementsService],
})
export class PaiementsModule {}
