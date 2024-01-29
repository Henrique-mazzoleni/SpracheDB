import { useState } from 'react';
import './App.css';
import SuchOption from './components/SuchOption';
import Nachfrage from './components/Nachfrage';
import SpracheListe from './components/SpracheListe';
import MitarbeiterListe from './components/MitarbeiterListe';

function App() {
  // die Zustand der Sucheeingabe verarbeiten
  const [eingegebeneAuswahl, setEingegebeneAuswahl] = useState('');
  // die Art der Suche verarbeiten
  const [sucheAuswahl, setSucheAuswahl] = useState<'sprache' | 'mitarbeiter'>(
    'sprache'
  );

  const hanndleInput = (eingabe: string) => {
    setEingegebeneAuswahl(eingabe);
  };

  const handleSucheAuswahl = (auswahl: 'sprache' | 'mitarbeiter') => {
    setSucheAuswahl(auswahl);
  };

  return (
    <>
      <h1>Programmiersprachen</h1>
      <SuchOption onAuswahl={handleSucheAuswahl} />
      <Nachfrage sucheAuswahl={sucheAuswahl} onSubmit={hanndleInput} />
      {sucheAuswahl === 'sprache' && (
        <SpracheListe sprache={eingegebeneAuswahl} />
      )}
      {sucheAuswahl === 'mitarbeiter' && (
        <MitarbeiterListe mitarbeiter={eingegebeneAuswahl} />
      )}
    </>
  );
}

export default App;
