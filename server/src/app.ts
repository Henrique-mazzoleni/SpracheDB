import { config } from 'dotenv';
import express from 'express';
import { Request, Response, NextFunction } from 'express';

import db from './db';

import alleDatenAbrufen from './daten/datenAbrufen';
import Mitarbeiter from './models/mitarbeiter.model';

config();
db().catch((error) => console.log('Error connecting to mongo: ', error));
const app = express();

app.get('/api/daten-abrufen', async (req, res, next) => {
  try {
    await alleDatenAbrufen();

    res
      .status(200)
      .json({ nachricht: 'Daten von API geladen und im DB eingefügt' });
  } catch (error) {
    next(error);
  }
});

app.get('/api/:mitarbeiterLogin', async (req, res, next) => {
  const { mitarbeiterLogin } = req.params;

  try {
    const mitarbeiter = await Mitarbeiter.findOne({
      login: mitarbeiterLogin,
    })
      .populate('sprachen')
      .populate({
        path: 'sprachen',
        populate: { path: 'id', model: 'Sprache' },
      });

    if (!mitarbeiter) {
      res
        .status(404)
        .json('Kein Mitarbeiter in der DB mit dem angegebenen Login.');
      return;
    }

    const sprachenObj: Record<string, number> = {};

    mitarbeiter.sprachen.forEach((sprache) => {
      sprachenObj[sprache.get('id').name] = sprache.get('vorkommnisse');
    });

    const mitarbeiterBereinigt = {
      login: mitarbeiter.login,
      sprachen: sprachenObj,
    };

    res.status(200).json(mitarbeiterBereinigt);
  } catch (error) {
    next(error);
  }
});

app.use((req, res, next) => {
  // this middleware runs whenever requested page is not available
  res.status(404).json({ message: 'This route does not exist' });
});

app.use(
  (error: Error, req: Request, res: Response, next: NextFunction): void => {
    // whenever you call next(err), this middleware will handle the error
    // always logs the error
    console.error('ERROR', req.method, req.path, error);

    // only render if the error ocurred before sending the response
    if (!res.headersSent) {
      res.status(500).json({
        message:
          'Internal server error. Please try again. If error persist please contact the service provider.',
      });
    }
  }
);

export default app;
