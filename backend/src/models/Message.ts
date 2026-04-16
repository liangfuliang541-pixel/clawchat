import mongoose, { Schema, type Document } from 'mongoose';
import type { Message as IMessage } from '@clawchat/shared';

export interface IMessageDoc extends Omit<IMessage, '_id' | 'sender' | 'receiver'>, Document {
  sender: mongoose.Types.ObjectId;
  receiver: mongoose.Types.ObjectId;
}

const MessageSchema = new Schema<IMessageDoc>(
  {
    sender: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    receiver: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    conversationId: { type: String, required: true, index: true },
    content: { type: String, required: true, maxlength: 2000 },
    type: { type: String, enum: ['text', 'image', 'file'], default: 'text' },
    fileUrl: { type: String },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

MessageSchema.index({ conversationId: 1, createdAt: -1 });

export const Message = mongoose.model<IMessageDoc>('Message', MessageSchema);
