import { connect } from 'mongoose';

const MONGO_URI =
  process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/spracheDB';

const db = async () => {
  const server = await connect(MONGO_URI);

  console.log(
    `mongodb connected! Database name: ${server.connections[0].name}`
  );
};

export default db;
