import mongoose, { Schema, type Document } from 'mongoose';

export interface IHermesConfigDoc extends Document {
  name: string;
  baseUrl: string;
  apiKey: string;
  agentModel?: string;
  enabled: boolean;
  autoReply?: boolean;
  systemPrompt?: string;
  createdAt: Date;
  updatedAt: Date;
}

const HermesConfigSchema = new Schema<IHermesConfigDoc>(
  {
    name: { type: String, required: true, unique: true, trim: true },
    baseUrl: { type: String, required: true, trim: true },
    apiKey: { type: String, required: true, select: false },
    agentModel: { type: String, trim: true },
    enabled: { type: Boolean, default: true },
    autoReply: { type: Boolean, default: false },
    systemPrompt: { type: String, trim: true },
  },
  { timestamps: true }
);

export const HermesConfig = mongoose.model<IHermesConfigDoc>('HermesConfig', HermesConfigSchema);
