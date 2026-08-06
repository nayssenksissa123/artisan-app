import { Injectable, NotFoundException } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { db } from '../drizzle/db';
import { MessageModel } from '../models/message.model';
import { CreateMessageDto } from '../dto/create-message.dto';

@Injectable()
export class MessagesService {
  async findAll() {
    return db.query.messages.findMany();
  }

  async findOne(id: number) {
    const message = await db.query.messages.findFirst({
      where: eq(MessageModel.id, id),
    });
    if (!message) {
      throw new NotFoundException('Message introuvable.');
    }
    return message;
  }

  async findByDemande(demandeId: number) {
    return db.query.messages.findMany({
      where: eq(MessageModel.demandeId, demandeId),
    });
  }

  async create(dto: CreateMessageDto) {
    const [nouveau] = await db.insert(MessageModel).values(dto).returning();
    return nouveau;
  }

  async remove(id: number) {
    await this.findOne(id);
    await db.delete(MessageModel).where(eq(MessageModel.id, id));
    return { message: 'Message supprimé.' };
  }
}
