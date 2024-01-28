import { config } from 'dotenv';
import express from 'express';

import db from './db';

import alleDatenAbrufen from './daten/datenAbrufen';

config();
db().catch((error) => console.log('Error connecting to mongo: ', error));
const app = express();
/*
alleDatenAbrufen()
  .then(() => console.log('Daten erfolgreich im DB eingefügt'))
  .catch((error)=>console.log('Fehler beim abrufen von daten aus der API', error));
*/
export default app;
