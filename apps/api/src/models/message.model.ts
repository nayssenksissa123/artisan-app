import { messages } from '../drizzle/schema';
import { InferSelectModel, InferInsertModel } from 'drizzle-orm';

export const MessageModel = messages;
export type Message = InferSelectModel<typeof messages>;
export type NouveauMessage = InferInsertModel<typeof messages>;
