import { FC, useState } from 'react';

type NachfrageProps = {
  sucheAuswahl: 'sprache' | 'mitarbeiter';
  onSubmit: (input: string) => void;
};

const Nachfrage: FC<NachfrageProps> = ({ sucheAuswahl, onSubmit }) => {
  const [eingabe, setEingabe] = useState('');

  const handleInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEingabe(event.target.value);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    onSubmit(eingabe);
    setEingabe('');
  };

  return (
    <form onSubmit={handleSubmit} className="suche-formular">
      <label htmlFor="eingabe-suche">
        {sucheAuswahl[0].toUpperCase()}
        {sucheAuswahl.slice(1)} Eingeben
      </label>
      <input
        id="eingabe-suche"
        type="text"
        onChange={handleInput}
        value={eingabe}
      />
    </form>
  );
};

export default Nachfrage;
