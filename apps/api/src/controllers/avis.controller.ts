import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { AvisService } from '../services/avis.service';
import { CreateAvisDto } from '../dto/create-avis.dto';

@Controller('avis')
export class AvisController {
  constructor(private readonly avisService: AvisService) {}

  @Get()
  findAll() {
    return this.avisService.findAll();
  }

  @Get('artisan/:artisanId')
  findByArtisan(@Param('artisanId', ParseIntPipe) artisanId: number) {
    return this.avisService.findByArtisan(artisanId);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.avisService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateAvisDto) {
    return this.avisService.create(dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.avisService.remove(id);
  }
}
