import { config } from 'dotenv';
import express from 'express';
import cors from 'cors';
import { Request, Response, NextFunction } from 'express';

import db from './db';

import alleDatenAbrufen from './daten/datenAbrufen';
import Mitarbeiter from './models/mitarbeiter.model';
import Sprache from './models/sprache.model';

config();
db().catch((error) => console.log('Error connecting to mongo: ', error));
const app = express();

const FRONTEND_URL = process.env.ORIGIN || 'http://localhost:5173';

app.use(
  cors({
    credentials: true,
    origin: [FRONTEND_URL],
  })
);

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

app.get('/api/mitarbeiter/', async (req, res, next) => {
  try {
    const alleMitarbeiter = await Mitarbeiter.find().populate({
      path: 'sprachen',
      populate: { path: 'id', model: 'Sprache' },
    });

    if (!alleMitarbeiter) {
      res.status(404).json('Keine Mitarbeiter in der DB vorhanden.');
      return;
    }

    const alleMitarbeiterBereinigt = alleMitarbeiter.map((mitarbeiter) => {
      const sprachenObj: Record<string, number> = {};

      mitarbeiter.sprachen
        .sort((a, b) => b.get('vorkommnisse') - a.get('vorkommnisse'))
        .forEach((sprache) => {
          sprachenObj[sprache.get('id').name] = sprache.get('vorkommnisse');
        });

      return {
        login: mitarbeiter.login,
        sprachen: sprachenObj,
      };
    });

    res.status(200).json(alleMitarbeiterBereinigt);
  } catch (error) {
    next(error);
  }
});

app.get('/api/mitarbeiter/:mitarbeiterLogin', async (req, res, next) => {
  const { mitarbeiterLogin } = req.params;

  try {
    const mitarbeiter = await Mitarbeiter.findOne({
      login: mitarbeiterLogin,
    }).populate({
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

    mitarbeiter.sprachen
      .sort((a, b) => b.get('vorkommnisse') - a.get('vorkommnisse'))
      .forEach((sprache) => {
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

app.get('/api/sprachen', async (req, res, next) => {
  try {
    const sprachen = await Sprache.find().populate({
      path: 'mitarbeiter',
      populate: { path: 'id', model: 'Mitarbeiter' },
    });

    if (!sprachen) {
      res.status(404).json('Keine Sprache ist in der DB vorhanden.');
      return;
    }

    const spracheBereinigt = sprachen.map((sprache) => {
      const mitArbeiterObj: Record<string, number> = {};

      sprache.mitarbeiter
        .sort((a, b) => b.get('vorkommnisse') - a.get('vorkommnisse'))
        .forEach((mitarbeiter) => {
          mitArbeiterObj[mitarbeiter.get('id').login] =
            mitarbeiter.get('vorkommnisse');
        });

      return {
        name: sprache.name,
        mitarbeiter: mitArbeiterObj,
      };
    });

    res.status(200).json(spracheBereinigt);
  } catch (error) {
    next(error);
  }
});

app.get('/api/sprachen/:spracheName', async (req, res, next) => {
  const { spracheName } = req.params;

  try {
    const spracheDB = await Sprache.findOne({ name: spracheName }).populate({
      path: 'mitarbeiter',
      populate: { path: 'id', model: 'Mitarbeiter' },
    });

    if (!spracheDB) {
      res
        .status(404)
        .json(
          'Keine Sprache mit der vorgegebene Name ist in der DB vorhanden.'
        );
      return;
    }

    const mitArbeiterObj: Record<string, number> = {};

    spracheDB.mitarbeiter
      .sort((a, b) => b.get('vorkommnisse') - a.get('vorkommnisse'))
      .forEach((mitarbeiter) => {
        mitArbeiterObj[mitarbeiter.get('id').login] =
          mitarbeiter.get('vorkommnisse');
      });

    const spracheBereinigt = {
      name: spracheDB.name,
      mitarbeiter: mitArbeiterObj,
    };

    res.status(200).json(spracheBereinigt);
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
