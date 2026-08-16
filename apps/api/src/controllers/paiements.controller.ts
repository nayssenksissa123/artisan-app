import { Controller, Get, Post, Patch, Param, Body } from '@nestjs/common';
import { PaiementsService } from '../services/paiements.service';
import { CreatePaiementDto } from '../dto/create-paiement.dto';

@Controller('paiements')
export class PaiementsController {
  constructor(private readonly paiementsService: PaiementsService) {}

  @Get()
  findAll() {
    return this.paiementsService.findAll();
  }

  @Get('demande/:demandeId')
  findByDemande(@Param('demandeId') demandeId: string) {
    return this.paiementsService.findByDemande(+demandeId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.paiementsService.findOne(+id);
  }

  @Post()
  create(@Body() dto: CreatePaiementDto) {
    return this.paiementsService.create(dto);
  }

  @Patch(':id/statut')
  updateStatut(@Param('id') id: string, @Body('statut') statut: string) {
    return this.paiementsService.updateStatut(+id, statut);
  }
}
