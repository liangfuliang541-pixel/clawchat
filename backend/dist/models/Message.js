import mongoose, { Schema } from 'mongoose';
const MessageSchema = new Schema({
    sender: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    receiver: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    conversationId: { type: String, required: true, index: true },
    content: { type: String, required: true, maxlength: 2000 },
    type: { type: String, enum: ['text', 'image', 'file'], default: 'text' },
    fileUrl: { type: String },
    isRead: { type: Boolean, default: false },
}, { timestamps: true });
MessageSchema.index({ conversationId: 1, createdAt: -1 });
export const Message = mongoose.model('Message', MessageSchema);
