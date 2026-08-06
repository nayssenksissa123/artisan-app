import { Module } from '@nestjs/common';
import { DemandesController } from '../controllers/demandes.controller';
import { DemandesService } from '../services/demandes.service';

@Module({
  controllers: [DemandesController],
  providers: [DemandesService],
})
export class DemandesModule {}
