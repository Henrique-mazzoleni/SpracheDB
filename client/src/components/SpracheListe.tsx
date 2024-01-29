import { FC, useEffect, useState } from 'react';
import axios from 'axios';

type SpracheListeProps = {
  sprache: string;
};

type SpracheElement = {
  name: string;
  mitarbeiter: Record<string, number>;
};

// die gesuchte Sprache Laden und eine liste der Mitarbeiter zeigen
const SpracheListe: FC<SpracheListeProps> = ({ sprache }) => {
  const [spracheObj, setSprache] = useState<SpracheElement>({
    name: '',
    mitarbeiter: {},
  });
  const [fehler, setFehler] = useState(true);

  // daten aus der Server Laden
  useEffect(() => {
    const spracheEinkunftAbholen = async () => {
      try {
        const { data } = await axios.get(
          `http://localhost:5005/api/sprachen/${sprache}`
        );

        setFehler(false);
        setSprache(data);
      } catch (error) {
        setFehler(true);
      }
    };
    spracheEinkunftAbholen();
  }, [sprache]);

  const FehlerElement = (
    <p>Die Sprache "{sprache}" ist nicht in der DB vorhanden.</p>
  );

  // Liste gestalten
  const SpracheElement = (
    <div className="ergebniss">
      <h3>{spracheObj.name}</h3>
      <ul>
        {spracheObj.mitarbeiter &&
          Object.keys(spracheObj.mitarbeiter).map((mitarbeiterLogin) => (
            <li key={mitarbeiterLogin}>
              <span>{mitarbeiterLogin}</span>
              <span>{spracheObj.mitarbeiter[mitarbeiterLogin]}</span>
            </li>
          ))}
      </ul>
    </div>
  );

  return (
    <>
      <h2>Ergebnis</h2>
      {fehler ? FehlerElement : SpracheElement}
    </>
  );
};

export default SpracheListe;
