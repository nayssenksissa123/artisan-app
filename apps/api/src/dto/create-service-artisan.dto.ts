import { IsNotEmpty, IsNumber, IsPositive } from 'class-validator';

export class CreateServiceArtisanDto {
  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  prix: number;

  @IsNotEmpty()
  @IsNumber()
  artisanId: number;

  @IsNotEmpty()
  @IsNumber()
  serviceId: number;
}
