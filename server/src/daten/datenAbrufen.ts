import axios from 'axios';
import Mitarbeiter from '../models/mitarbeiter.model';
import Repo from '../models/repo.model';
import Sprache from '../models/sprache.model';
import { Types } from 'mongoose';

type MitarbeiterListReturnType = {
  login: string;
  repos_url: string;
};

type ReposListReturnType = {
  name: string;
  languages_url: string;
  contributors_url: string;
};

// Alle daten aus der API abrufen und in die DB einfügen
const alleDatenAbrufen = async () => {
  // Mitarbeiter abrufen und einfügen
  const alleMitarbeiter = (await alleMitarbeiterAbrufenUndEinfügen()) ?? [];

  // alle Repos abrufen und einfügen
  for (const mitarbeiter of alleMitarbeiter) {
    const repos = (await alleReposAbrufenUndEinfügen(mitarbeiter.login)) ?? [];

    // für jeder repo die Sprachen abrufen und einfügen
    for (const repo of repos) {
      await repoInMitarbeiterEinfügen(mitarbeiter.id, repo.id);
      const sprachen =
        (await sprachenAbrufenUndEinfügen(mitarbeiter.login, repo.name)) ?? [];
      for (const spracheId of sprachen) {
        await spracheInMitarbeiterEinfügen(mitarbeiter.id, spracheId);
        await repoInSpracheEinfügen(spracheId, repo.id);
      }
    }
  }

  // alle Beitragende von repos zu Sprachen ergänzen ergänzen
  const alleRepos = (await Repo.find()) ?? [];
  for (const repo of alleRepos) {
    const mitarbeiterDB = await Mitarbeiter.findById(repo.mitarbeiter[0]);
    if (mitarbeiterDB && typeof mitarbeiterDB.login === 'string')
      await alleBeitragendeAbrufenUndEinfügen(mitarbeiterDB.login, repo.name);
  }
};

// alle Mitarbeiter von github api abrufen und in die DB einfugen
const alleMitarbeiterAbrufenUndEinfügen = async () => {
  try {
    // alle Mitarbeiter von API laden
    const { data: mitarbeiterList } = await axios.get<
      MitarbeiterListReturnType[]
    >('https://api.github.com/orgs/codecentric/members', {
      headers: {
        'User-Agent': process.env.GITHUB_USER,
        Authorization: `Bearer ${process.env.GITHUB_API_TOKEN}`,
      },
    });

    // jeder Mitarbeiter in die DB einfügen
    const mitarbeiterArray: { id: Types.ObjectId; login: string }[] = [];
    for (const mitarbeiter of mitarbeiterList) {
      const neueMitarbeiter = await neueMitarbeiterEinfügen(mitarbeiter.login);
      if (neueMitarbeiter && typeof neueMitarbeiter.login === 'string')
        mitarbeiterArray.push({
          id: neueMitarbeiter._id,
          login: neueMitarbeiter.login,
        });
    }

    return mitarbeiterArray;
  } catch (error) {
    console.log(`Fehler beim Abrufen und Einfugen der Mitarbeiter: ${error}`);
  }
};

// alle repos von gegebenen mitarbeiter abrufen und in die DB einfügen
const alleReposAbrufenUndEinfügen = async (mitarbeiterLogin: string) => {
  try {
    // die Repos vom Mitarbeiter von API laden
    const { data: reposList } = await axios.get<ReposListReturnType[]>(
      `https://api.github.com/users/${mitarbeiterLogin}/repos`,
      {
        headers: {
          'User-Agent': process.env.GITHUB_USER,
          Authorization: `Bearer ${process.env.GITHUB_API_TOKEN}`,
        },
      }
    );

    // besitzer in der DB finden
    const besitzer = await Mitarbeiter.findOne({ login: mitarbeiterLogin });
    if (!besitzer) throw new Error('Mitarbeiter nicht in der DB');

    // repos in die DB einfügen
    const reposArray: { id: Types.ObjectId; name: string }[] = [];
    for (const repo of reposList) {
      const neueRepo = await neueRepoEinfügen(repo.name);
      if (neueRepo) reposArray.push({ id: neueRepo._id, name: neueRepo.name });
    }

    return reposArray;
  } catch (error) {
    console.log(
      `Fehler beim Abrufen der Repos von ${mitarbeiterLogin}: ${error}`
    );
  }
};

// alle Sprachen im gegebenen Repo von gegebenen Mitarbeiter benutz abrufen und im DB einfügen
const sprachenAbrufenUndEinfügen = async (
  mitarbeiterLogin: string,
  repoName: string
) => {
  try {
    // Sprachen von APi laden
    const { data: sprachen } = await axios.get<Record<string, number>[]>(
      `https://api.github.com/repos/${mitarbeiterLogin}/${repoName}/languages`,
      {
        headers: {
          'User-Agent': process.env.GITHUB_USER,
          Authorization: `Bearer ${process.env.GITHUB_API_TOKEN}`,
        },
      }
    );

    // Sieht ob Sprache sich schon in der DB befindet, wenn ja Vorkommnisse ergänzen, wenn nein einfügen
    const sprachenArray: Types.ObjectId[] = [];
    for (const spracheName in sprachen) {
      const sprache = await Sprache.findOne({ name: spracheName });
      if (!sprache) {
        const neueSprache = await neueSpracheEinfügen(spracheName);
        if (neueSprache) sprachenArray.push(neueSprache._id);
      } else {
        sprachenArray.push(sprache._id);
      }
    }

    return sprachenArray;
  } catch (error) {
    console.log(
      `Fehler beim Abrufen der Sprachen von ${mitarbeiterLogin} in Repo ${repoName}: ${error}`
    );
  }
};

// alle Beitragende vom Repo abrufen und ihre sprache im DB aktualizieren
const alleBeitragendeAbrufenUndEinfügen = async (
  mitarbeiterLogin: string,
  repoName: string
) => {
  try {
    // Beitragende von API laden
    const { data: beitragende } = await axios.get<MitarbeiterListReturnType[]>(
      `https://api.github.com/repos/${mitarbeiterLogin}/${repoName}/contributors`,
      {
        headers: {
          'User-Agent': process.env.GITHUB_USER,
          Authorization: `Bearer ${process.env.GITHUB_API_TOKEN}`,
        },
      }
    );

    // der repo und besitzer von DB laden
    const mitarbeiterDB = await Mitarbeiter.findOne({
      login: mitarbeiterLogin,
    });
    if (!mitarbeiterDB)
    throw new Error('Mitarbeiter nicht in der DB vorhanden.');
  
    const repoDB = await Repo.findOne({ name: repoName });
    if (!repoDB) throw new Error('Repo nicht in de DB vorhanden.');
  
  
    // Sieht ob beitragende ein Mitarbeiter bei der Codecentric ist, wenn ja Vorkommnisse ergänzen
    for (const bt of beitragende) {
      const mitarbeiter = await Mitarbeiter.findOne({ login: bt.login });
      if (!mitarbeiter || repoDB.mitarbeiter.includes(mitarbeiter._id))
        continue;

      for (const sprache of repoDB.sprachen) {
        await spracheInMitarbeiterEinfügen(mitarbeiter._id, sprache);
      }
      await repoInMitarbeiterEinfügen(mitarbeiter._id, repoDB._id);
    }
  } catch (error) {
    console.log(
      `Fehler beim Abrufen der Beitragenden in Repo ${repoName}: ${error}`
    );
  }
};

// eine neue Mitarbeiter zu der DB einfügen
const neueMitarbeiterEinfügen = async (mitarbeiterLogin: string) => {
  try {
    const mitarbeiterDB = await Mitarbeiter.findOne({
      login: mitarbeiterLogin,
    });
    if (mitarbeiterDB)
      throw new Error('Mitarbeiter schon in der DB vorhanden.');

    const neueMitarbeiter = new Mitarbeiter({
      login: mitarbeiterLogin,
    });
    await neueMitarbeiter.save();

    return neueMitarbeiter;
  } catch (error) {
    console.log(
      `Fehler beim einfügen der Mitarbeiter ${mitarbeiterLogin}: ${error}`
    );
  }
};

// eine neue Repo zu der DB einfügen
const neueRepoEinfügen = async (repoName: string) => {
  try {
    const neueRepo = new Repo({
      name: repoName,
    });
    await neueRepo.save();

    return neueRepo;
  } catch (error) {
    console.log(
      `Fehler beim einfügen der Repo ${repoName} in der DB: ${error}`
    );
  }
};

// eine neue Sprache zu der DB einfügen
const neueSpracheEinfügen = async (spracheName: string) => {
  try {
    const spracheDB = await Sprache.findOne({ name: spracheName });
    if (spracheDB) throw new Error('Sprache schon in der DB vorhanden.');

    const neueSprache = new Sprache({
      name: spracheName,
    });
    await neueSprache.save();

    return neueSprache;
  } catch (error) {
    console.log(
      `Fehler beim einfügen der Sprache ${spracheName} in der DB: ${error}`
    );
  }
};

// verbindet eine sprache zu eine Mitarbeiter und ergäntz die Vorkommnisse auf beides
const spracheInMitarbeiterEinfügen = async (
  mitarbeiterId: Types.ObjectId,
  spracheId: Types.ObjectId
) => {
  try {
    // sprache und Mitarbeiter aus der DB laden
    const spracheDB = await Sprache.findById(spracheId);
    if (!spracheDB) throw new Error('Sprache nicht in der DB vorhanden.');

    const mitarbeiterDB = await Mitarbeiter.findById(mitarbeiterId);
    if (!mitarbeiterDB)
      throw new Error('Mitarbeiter nicht in der DB vorhanden.');

    // wenn die Sprache schon im Mitarbeiter vorhanden ist, ergänzen, ansonsten einfügen
    const schonImMitarbeiter =
      mitarbeiterDB.sprachen.filter((sprache) =>
        sprache.get('id').equals(spracheId)
      ).length !== 0;
    if (schonImMitarbeiter) {
      await Mitarbeiter.findOneAndUpdate(
        { 'sprachen.id': spracheId, _id: mitarbeiterId },
        { $inc: { 'sprachen.$.vorkommnisse': 1 } }
      );
    } else {
      mitarbeiterDB.sprachen.push({
        id: spracheId,
        vorkommnisse: 1,
      });
      await mitarbeiterDB.save();
    }

    // wenn der Mitarbeiter schon im Sprache vorhanden ist, ergänzen, ansonsten einfügen
    const schonImSprache =
      spracheDB.mitarbeiter.filter((mitarbeiter) =>
        mitarbeiter.get('id').equals(mitarbeiterId)
      ).length !== 0;
    if (schonImSprache) {
      await Sprache.findOneAndUpdate(
        { 'mitarbeiter.id': mitarbeiterId, _id: spracheId },
        { $inc: { 'mitarbeiter.$.vorkommnisse': 1 } }
      );
    } else {
      spracheDB.mitarbeiter.push({
        id: mitarbeiterId,
        vorkommnisse: 1,
      });
      await spracheDB.save();
    }
  } catch (error) {
    console.log(
      `Fehler beim Einfügen der Sprache ${spracheId} in mitarbeiter ${mitarbeiterId}: ${error}`
    );
  }
};

// verbindet eine Repo zu eine Mitarbeiter
const repoInMitarbeiterEinfügen = async (
  mitarbeiterId: Types.ObjectId,
  repoId: Types.ObjectId
) => {
  try {
    // Repo und Mitarbeiter aus der DB Laden
    const repoDB = await Repo.findById(repoId);
    if (!repoDB) throw new Error(`Repo ${repoId} nicht in der DB vorhanden.`);

    const mitarbeiterDB = await Mitarbeiter.findById(mitarbeiterId);
    if (!mitarbeiterDB)
      throw new Error('Mitarbeiter nicht in der DB vorhanden.');

    // Repo zu Mitarbeiter verbinden
    if (mitarbeiterDB.repos.includes(repoDB._id))
      throw new Error('Repo schon im Mitarbeiter vorhanden');
    mitarbeiterDB.repos.push(repoDB._id);
    await mitarbeiterDB.save();

    // Mitarbeiter zu Repo verbinden
    if (repoDB.mitarbeiter.includes(mitarbeiterDB._id))
      throw new Error('Mitarbeiter schon im Repo vorhanden');
    repoDB.mitarbeiter.push(mitarbeiterDB._id);
    await repoDB.save();
  } catch (error) {
    console.log(`Fehler beim Einfügen der Repo in mitarbeiter: ${error}`);
  }
};

// verbinidet eine Repo zu eine Sprache
const repoInSpracheEinfügen = async (
  spracheId: Types.ObjectId,
  repoId: Types.ObjectId
) => {
  try {
    // Repo und Sprache aus der API laden
    const repoDB = await Repo.findById(repoId);
    if (!repoDB) throw new Error('Repo nicht in der DB vorhanden.');

    const spracheDB = await Sprache.findById(spracheId);
    if (!spracheDB) throw new Error('Sprache nicht in der DB vorhanden.');

    // Repo zu Sprache verbinden
    if (spracheDB.repos.includes(repoDB._id))
      throw new Error('Repo schon im Sprache vorhanden');
    spracheDB.repos.push(repoDB._id);
    await spracheDB.save();

    // Sprache zu Repo verbinden
    if (repoDB.sprachen.includes(spracheDB._id))
      throw new Error('Sprache schon im Repo vorhanden');
    repoDB.mitarbeiter.push(spracheDB._id);
    await repoDB.save();
  } catch (error) {
    console.log(`Fehler beim Einfügen der Repo in Sprache: ${error}`);
  }
};

export default alleDatenAbrufen;
