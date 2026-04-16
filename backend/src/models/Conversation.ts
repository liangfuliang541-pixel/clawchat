import mongoose, { Schema, type Document } from 'mongoose';
import type { Conversation as IConversation } from '@clawchat/shared';

export interface IConversationDoc extends Omit<IConversation, '_id' | 'participants' | 'lastMessage'>, Document {
  participants: mongoose.Types.ObjectId[];
  lastMessage?: mongoose.Types.ObjectId;
}

const ConversationSchema = new Schema<IConversationDoc>(
  {
    participants: [{ type: Schema.Types.ObjectId, ref: 'User', required: true }],
    type: { type: String, enum: ['private', 'group'], default: 'private' },
    name: { type: String, trim: true },
    avatar: { type: String },
    lastMessage: { type: Schema.Types.ObjectId, ref: 'Message' },
  },
  { timestamps: true }
);

ConversationSchema.index({ participants: 1, updatedAt: -1 });

export const Conversation = mongoose.model<IConversationDoc>('Conversation', ConversationSchema);
