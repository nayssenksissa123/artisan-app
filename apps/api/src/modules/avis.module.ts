import { Module } from '@nestjs/common';
import { AvisController } from '../controllers/avis.controller';
import { AvisService } from '../services/avis.service';

@Module({
  controllers: [AvisController],
  providers: [AvisService],
})
export class AvisModule {}
