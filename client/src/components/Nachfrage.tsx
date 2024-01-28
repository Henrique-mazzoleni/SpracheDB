import { FC, useState } from 'react';

type NachfrageProps = {
  onSubmit: (input: string) => void;
};

const Nachfrage: FC<NachfrageProps> = ({ onSubmit }) => {
  const [spracheEingabe, setSpracheEingabe] = useState('');

  const handleInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSpracheEingabe(event.target.value);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    onSubmit(spracheEingabe);
    setSpracheEingabe('');
  };

  return (
    <form onSubmit={handleSubmit} className="spracheformular">
      <label htmlFor="sprache-suche">Sprache Eingeben</label>
      <input
        id="sprache-suche"
        type="text"
        onChange={handleInput}
        value={spracheEingabe}
      />
    </form>
  );
};

export default Nachfrage;
