import { config } from 'dotenv';
import { connect } from 'mongoose';

import alleDatenAbrufen from './daten/datenAbrufen';

config();
const MONGO_URI = 'mongodb://127.0.0.1:27017/spracheDB';

const run = async () => {
  const server = await connect(MONGO_URI);

  console.log(
    `mongodb connected! Database name: ${server.connections[0].name}`
  );

  // await alleDatenAbrufen();

  await server.disconnect();
  console.log('mongodb disconnected');
};

try {
  run();
} catch (error) {
  console.log(error);
}
