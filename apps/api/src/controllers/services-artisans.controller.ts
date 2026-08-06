import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { ServicesArtisansService } from '../services/services-artisans.service';
import { CreateServiceArtisanDto } from '../dto/create-service-artisan.dto';

@Controller('services-artisans')
export class ServicesArtisansController {
  constructor(private readonly servicesArtisansService: ServicesArtisansService) {}

  @Get()
  findAll() {
    return this.servicesArtisansService.findAll();
  }

  @Get('artisan/:artisanId')
  findByArtisan(@Param('artisanId', ParseIntPipe) artisanId: number) {
    return this.servicesArtisansService.findByArtisan(artisanId);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.servicesArtisansService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateServiceArtisanDto) {
    return this.servicesArtisansService.create(dto);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: Partial<CreateServiceArtisanDto>) {
    return this.servicesArtisansService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.servicesArtisansService.remove(id);
  }
}
