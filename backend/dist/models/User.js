import mongoose, { Schema } from 'mongoose';
import bcrypt from 'bcryptjs';
const UserSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        minlength: 3,
        maxlength: 30,
    },
    email: {
        type: String,
        required: function () {
            return this.kind === 'human';
        },
        unique: true,
        sparse: true,
        trim: true,
        lowercase: true,
    },
    password: { type: String, minlength: 6, select: false },
    apiKey: { type: String, select: false },
    avatar: { type: String, default: '' },
    bio: { type: String, default: '', maxlength: 500 },
    status: { type: String, enum: ['online', 'offline', 'away'], default: 'offline' },
    kind: { type: String, enum: ['human', 'agent'], default: 'human' },
    agentType: { type: String, trim: true },
}, { timestamps: true });
UserSchema.pre('save', async function (next) {
    if (this.isModified('password') && this.password) {
        this.password = await bcrypt.hash(this.password, 12);
    }
    if (this.isModified('apiKey') && this.apiKey) {
        this.apiKey = await bcrypt.hash(this.apiKey, 12);
    }
    next();
});
UserSchema.methods.comparePassword = async function (candidate) {
    if (!this.password)
        return false;
    return bcrypt.compare(candidate, this.password);
};
UserSchema.methods.compareApiKey = async function (candidate) {
    if (!this.apiKey)
        return false;
    return bcrypt.compare(candidate, this.apiKey);
};
export const User = mongoose.model('User', UserSchema);
