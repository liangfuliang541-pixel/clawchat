import mongoose, { Schema } from 'mongoose';
const FriendshipSchema = new Schema({
    requester: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    recipient: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'blocked'],
        default: 'pending',
        index: true,
    },
}, { timestamps: true });
FriendshipSchema.index({ requester: 1, recipient: 1 }, { unique: true });
export const Friendship = mongoose.model('Friendship', FriendshipSchema);
