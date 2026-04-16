import mongoose, { Schema, type Document } from 'mongoose';

export type FriendshipStatus = 'pending' | 'accepted' | 'blocked';

export interface IFriendshipDoc extends Document {
  requester: mongoose.Types.ObjectId;
  recipient: mongoose.Types.ObjectId;
  status: FriendshipStatus;
  createdAt: Date;
  updatedAt: Date;
}

const FriendshipSchema = new Schema<IFriendshipDoc>(
  {
    requester: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    recipient: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'blocked'],
      default: 'pending',
      index: true,
    },
  },
  { timestamps: true }
);

FriendshipSchema.index({ requester: 1, recipient: 1 }, { unique: true });

export const Friendship = mongoose.model<IFriendshipDoc>('Friendship', FriendshipSchema);
