import mongoose, { Schema } from 'mongoose';
const ConversationSchema = new Schema({
    participants: [{ type: Schema.Types.ObjectId, ref: 'User', required: true }],
    type: { type: String, enum: ['private', 'group'], default: 'private' },
    name: { type: String, trim: true },
    avatar: { type: String },
    lastMessage: { type: Schema.Types.ObjectId, ref: 'Message' },
}, { timestamps: true });
ConversationSchema.index({ participants: 1, updatedAt: -1 });
export const Conversation = mongoose.model('Conversation', ConversationSchema);
