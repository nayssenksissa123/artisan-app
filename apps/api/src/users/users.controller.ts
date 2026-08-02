import { Controller, Get, Patch, Body, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UsersService } from './users.service';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Controller()
export class UsersController {
  constructor(private usersService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @Get('profil')
  getProfil(@Request() req) {
    return this.usersService.getProfil(req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('profil')
  updateProfil(@Request() req, @Body() dto: UpdateProfileDto) {
    return this.usersService.updateProfil(req.user.userId, dto);
  }
}