import type { Model, FilterQuery, UpdateQuery, Types } from 'mongoose';

export class BaseRepository<T> {
  constructor(protected model: Model<T>) {}

  async create(data: Partial<T>): Promise<T> {
    return this.model.create(data);
  }

  async findById(id: string | Types.ObjectId): Promise<T | null> {
    return this.model.findById(id).lean<T>().exec();
  }

  async findOne(filter: FilterQuery<T>): Promise<T | null> {
    return this.model.findOne(filter).lean<T>().exec();
  }

  async find(filter: FilterQuery<T> = {}, limit = 100, skip = 0): Promise<T[]> {
    return this.model.find(filter).skip(skip).limit(limit).lean<T[]>().exec();
  }

  async update(id: string | Types.ObjectId, data: UpdateQuery<T>): Promise<T | null> {
    return this.model.findByIdAndUpdate(id, data, { new: true }).lean<T>().exec();
  }

  async delete(id: string | Types.ObjectId): Promise<T | null> {
    return this.model.findByIdAndDelete(id).lean<T>().exec();
  }

  async count(filter: FilterQuery<T> = {}): Promise<number> {
    return this.model.countDocuments(filter).exec();
  }
}
