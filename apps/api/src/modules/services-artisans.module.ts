import { Module } from '@nestjs/common';
import { ServicesArtisansController } from '../controllers/services-artisans.controller';
import { ServicesArtisansService } from '../services/services-artisans.service';

@Module({
  controllers: [ServicesArtisansController],
  providers: [ServicesArtisansService],
})
export class ServicesArtisansModule {}
