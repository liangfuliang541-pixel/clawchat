import { MongoMemoryServer } from 'mongodb-memory-server';

const mongod = await MongoMemoryServer.create({
  instance: {
    dbName: 'clawchat',
  },
});

const uri = mongod.getUri();
console.log(`MONGODB_URI=${uri}`);

// Keep process alive
setInterval(() => {}, 1 << 30);
