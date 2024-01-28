import { FC, useState } from 'react';

type SuchOptionProps = {
  onAuswahl: (auswahl: 'sprache' | 'mitarbeiter') => void;
};

const SuchOption: FC<SuchOptionProps> = ({ onAuswahl }) => {
  const [auswahl, setAuswahl] = useState('sprache');
  const handleAuswahl = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (
      event.target.value === 'sprache' ||
      event.target.value === 'mitarbeiter'
    ) {
      setAuswahl(event.target.value);
      onAuswahl(event.target.value);
    }
  };

  return (
    <div className="auswahl-container">
      <h2>Suche Auswählen</h2>
      <div className="auswahl-action">
        <div>
          <input
            type="radio"
            name="auswahl"
            value="sprache"
            id="sprache-auswahl"
            checked={auswahl === 'sprache'}
            onChange={handleAuswahl}
          />
          <label htmlFor="sprache-auswahl">Sprache</label>
        </div>
        <div>
          <input
            type="radio"
            name="auswahl"
            value="mitarbeiter"
            id="mitarbeiter-auswahl"
            checked={auswahl === 'mitarbeiter'}
            onChange={handleAuswahl}
          />
          <label htmlFor="mitarbeiter-auswahl">Mitarbeiter</label>
        </div>
      </div>
    </div>
  );
};

export default SuchOption;
