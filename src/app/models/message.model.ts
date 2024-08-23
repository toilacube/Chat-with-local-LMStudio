// src/app/models/message.model.ts

export interface Message {
    id: string;
    text: string;
    created_at: Date;
    isUser: boolean;
  }