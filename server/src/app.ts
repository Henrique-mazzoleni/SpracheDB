import { config } from 'dotenv';
import express from 'express';
import cors from 'cors';
import { Request, Response, NextFunction } from 'express';

import db from './db';

import alleDatenAbrufen from './daten/datenAbrufen';
import Mitarbeiter from './models/mitarbeiter.model';
import Sprache from './models/sprache.model';

config(); // Umgebung varieble laden
db().catch((error) => console.log('Error connecting to mongo: ', error)); // db starten
const app = express(); // server starten

const FRONTEND_URL = process.env.ORIGIN || 'http://localhost:5173';

// Lädt die Frontend wegen Cors
app.use(
  cors({
    credentials: true,
    origin: [FRONTEND_URL],
  })
);

// diese Endpunkt lädt alle daten aus der API und lädt in de DB
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

// hollt alle mitarbeiter aus de DB und gitb die daten im json format zurück
app.get('/api/mitarbeiter/', async (req, res, next) => {
  try {
    // alle mitarbeiter aus der DB laden
    const alleMitarbeiter = await Mitarbeiter.find().populate({
      path: 'sprachen',
      populate: { path: 'id', model: 'Sprache' },
    });

    if (!alleMitarbeiter) {
      res.status(404).json('Keine Mitarbeiter in der DB vorhanden.');
      return;
    }

    // daten reinigen für eine schönere präsentation
    const alleMitarbeiterBereinigt = alleMitarbeiter.map((mitarbeiter) => {
      const sprachenObj: Record<string, number> = {};

      // die sprache array auf die Vorkommnisse ordnen
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

// Eine bestimmte mitarbeiter laden
app.get('/api/mitarbeiter/:mitarbeiterLogin', async (req, res, next) => {
  const { mitarbeiterLogin } = req.params;

  try {
    // mitarbeiter aus der DB laden
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

    // die sprache array auf die Vorkommnisse ordnen
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

// alle sprachen aus der DB holen und im json format zurück geben
app.get('/api/sprachen', async (req, res, next) => {
  try {
    // Sprachen aus der DB laden
    const sprachen = await Sprache.find().populate({
      path: 'mitarbeiter',
      populate: { path: 'id', model: 'Mitarbeiter' },
    });

    if (!sprachen) {
      res.status(404).json('Keine Sprache ist in der DB vorhanden.');
      return;
    }

    // Daten bereinigen
    const spracheBereinigt = sprachen.map((sprache) => {
      const mitArbeiterObj: Record<string, number> = {};

      // mitarbeiter auf die Vorkommnisse ordnen
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

// eine bestimte Sprache aus der DB laden
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

    // mitarbeiter auf die Vorkommnisse ordnen
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
  // fallback Endpunkt für fehlhafte eingaben beim URL
  res.status(404).json({ message: 'This route does not exist' });
});

app.use(
  (error: Error, req: Request, res: Response, next: NextFunction): void => {
    // bei jedem Aufruf von next(error) wird diese Middleware den Fehler behandeln
    console.error('ERROR', req.method, req.path, error);

    // nur wiedergeben, wenn der Fehler vor dem Senden der Antwort aufgetreten ist
    if (!res.headersSent) {
      res.status(500).json({
        message:
          'Internal server error. Please try again. If error persist please contact the service provider.',
      });
    }
  }
);

export default app;
