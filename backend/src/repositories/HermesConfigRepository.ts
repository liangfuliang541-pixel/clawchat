import { BaseRepository } from './BaseRepository.js';
import { HermesConfig, type IHermesConfigDoc } from '../models/HermesConfig.js';
import { mockDB } from '../config/mockDatabase.js';

export interface HermesConfigData {
  name: string;
  baseUrl: string;
  apiKey: string;
  agentModel?: string;
  enabled?: boolean;
  autoReply?: boolean;
  systemPrompt?: string;
}

export class HermesConfigRepository extends BaseRepository<IHermesConfigDoc> {
  constructor() {
    super(HermesConfig);
  }

  async findByName(name: string): Promise<any | null> {
    if (process.env.USE_MOCK_DB === 'true') {
      return mockDB.findHermesConfigByName(name);
    }
    return this.model.findOne({ name }).lean().exec();
  }

  async findEnabled(): Promise<any[]> {
    if (process.env.USE_MOCK_DB === 'true') {
      return mockDB.findHermesConfigs({ enabled: true });
    }
    return this.model.find({ enabled: true }).lean().exec();
  }

  async upsertByName(data: HermesConfigData): Promise<any> {
    if (process.env.USE_MOCK_DB === 'true') {
      return mockDB.upsertHermesConfig(data);
    }
    const existing = await this.model.findOneAndUpdate({ name: data.name }, data, {
      new: true,
      upsert: true,
    });
    return existing!.toObject();
  }

  async deleteByName(name: string): Promise<void> {
    if (process.env.USE_MOCK_DB === 'true') {
      mockDB.deleteHermesConfig(name);
      return;
    }
    await this.model.deleteOne({ name });
  }
}

export const hermesConfigRepository = new HermesConfigRepository();
