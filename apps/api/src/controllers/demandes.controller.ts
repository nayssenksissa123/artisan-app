import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { DemandesService } from '../services/demandes.service';
import { CreateDemandeDto, UpdateStatutDemandeDto } from '../dto/create-demande.dto';

@Controller('demandes')
export class DemandesController {
  constructor(private readonly demandesService: DemandesService) {}

  @Get()
  findAll() {
    return this.demandesService.findAll();
  }

  @Get('client/:clientId')
  findByClient(@Param('clientId', ParseIntPipe) clientId: number) {
    return this.demandesService.findByClient(clientId);
  }

  @Get('artisan/:artisanId')
  findByArtisan(@Param('artisanId', ParseIntPipe) artisanId: number) {
    return this.demandesService.findByArtisan(artisanId);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.demandesService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateDemandeDto) {
    return this.demandesService.create(dto);
  }

  @Patch(':id/statut')
  updateStatut(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateStatutDemandeDto) {
    return this.demandesService.updateStatut(id, dto);
  }

  @Patch(':id/annuler')
  annuler(@Param('id', ParseIntPipe) id: number) {
    return this.demandesService.annuler(id);
  }
}
