import { FC, useEffect, useState } from 'react';
import axios from 'axios';

type MitarbeiterListeProps = {
  mitarbeiter: string;
};

type MitarbeiterElement = {
  login: string;
  sprachen: Record<string, number>;
};

// der Mitarberter Laden und eine liste seine Sprachen zeigen
const MitarbeiterListe: FC<MitarbeiterListeProps> = ({ mitarbeiter }) => {
  // zustand der geladene Daten
  const [mitarbeiterObj, setMitarbeiterObj] = useState<MitarbeiterElement>({
    login: '',
    sprachen: {},
  });
  const [fehler, setFehler] = useState(true);

  // die Daten aus der Server Laden
  useEffect(() => {
    const spracheEinkunftAbholen = async () => {
      try {
        const { data } = await axios.get(
          `http://localhost:5005/api/mitarbeiter/${mitarbeiter}`
        );

        setFehler(false);
        setMitarbeiterObj(data);
      } catch (error) {
        setFehler(true);
      }
    };
    spracheEinkunftAbholen();
  }, [mitarbeiter]);

  // Fehler verarbeiten
  const FehlerElement = (
    <p>
      Die Mitarbeiter mit Login "{mitarbeiter}" ist nicht in der DB vorhanden.
    </p>
  );

  // die Mitarbeiter und Sprache liste gestalten
  const MitarbeiterElement = (
    <div className="ergebniss">
      <h3>{mitarbeiterObj.login}</h3>
      <ul>
        {mitarbeiterObj.login &&
          Object.keys(mitarbeiterObj.sprachen).map((spracheName) => (
            <li key={spracheName}>
              <span>{spracheName}</span>
              <span>{mitarbeiterObj.sprachen[spracheName]}</span>
            </li>
          ))}
      </ul>
    </div>
  );

  return (
    <>
      <h2>Ergebnis</h2>
      {fehler ? FehlerElement : MitarbeiterElement}
    </>
  );
};

export default MitarbeiterListe;
