import { IsNotEmpty, IsString, IsNumber, IsOptional, IsIn } from 'class-validator';

export class CreateDemandeDto {
  @IsNotEmpty()
  @IsString()
  description: string;

  @IsNotEmpty()
  @IsString()
  adresse: string;

  @IsNotEmpty()
  @IsNumber()
  clientId: number;

  @IsNotEmpty()
  @IsNumber()
  serviceArtisanId: number;
}

export class UpdateStatutDemandeDto {
  @IsNotEmpty()
  @IsIn(['EN_ATTENTE', 'ACCEPTEE', 'REFUSEE', 'EN_COURS', 'TERMINEE', 'ANNULEE'])
  statut: string;

  @IsOptional()
  @IsNumber()
  artisanId?: number;
}
