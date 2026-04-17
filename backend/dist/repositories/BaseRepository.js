export class BaseRepository {
    model;
    constructor(model) {
        this.model = model;
    }
    async create(data) {
        return this.model.create(data);
    }
    async findById(id) {
        return this.model.findById(id).lean().exec();
    }
    async findOne(filter) {
        return this.model.findOne(filter).lean().exec();
    }
    async find(filter = {}, limit = 100, skip = 0) {
        return this.model.find(filter).skip(skip).limit(limit).lean().exec();
    }
    async update(id, data) {
        return this.model.findByIdAndUpdate(id, data, { new: true }).lean().exec();
    }
    async delete(id) {
        return this.model.findByIdAndDelete(id).lean().exec();
    }
    async count(filter = {}) {
        return this.model.countDocuments(filter).exec();
    }
}
