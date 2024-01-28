import { FC, useEffect, useState } from 'react';
import axios from 'axios';

type SpracheListeProps = {
  sprache: string;
};

type SpracheElement = {
  name: string;
  mitarbeiter: Record<string, number>;
};

const SpracheListe: FC<SpracheListeProps> = ({ sprache }) => {
  const [spracheObj, setSprache] = useState<SpracheElement>({
    name: '',
    mitarbeiter: {},
  });

  useEffect(() => {
    const spracheEinkunftAbholen = async () => {
      try {
        const { data } = await axios.get(
          `http://localhost:5005/api/sprachen/${sprache}`
        );

        console.log(data);
        setSprache(data);
      } catch (error) {
        console.log(error);
      }
    };
    spracheEinkunftAbholen();
  }, [sprache]);

  const SpracheElement = (
    <li>
      {spracheObj.name}{' '}
      <ul>
        {spracheObj.name && (
          <>
            {Object.keys(spracheObj.mitarbeiter).map((mitarbeiterLogin) => (
              <li>
                {mitarbeiterLogin}: {spracheObj.mitarbeiter[mitarbeiterLogin]}
              </li>
            ))}
          </>
        )}
      </ul>
    </li>
  );

  return (
    <>
      <h3>Ergebnis</h3>
      <ul>{SpracheElement}</ul>
    </>
  );
};

export default SpracheListe;
