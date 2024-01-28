import { useState } from 'react';
import './App.css';
import Nachfrage from './components/Nachfrage';
import SpracheListe from './components/SpracheListe';
import SuchOption from './components/SuchOption';

function App() {
  const [eingegebeneSprache, setEingegebeneSprache] = useState('');
  const [sucheAuswahl, setSucheAuswahl] = useState<'sprache' | 'mitarbeiter'>(
    'sprache'
  );

  const hanndleInput = (eingabe: string) => {
    setEingegebeneSprache(eingabe);
  };

  const handleSucheAuswahl = (auswahl: 'sprache' | 'mitarbeiter') => {
    setSucheAuswahl(auswahl);
  };

  return (
    <>
      <h1>Programmiersprachen</h1>
      <SuchOption onAuswahl={handleSucheAuswahl} />
      <Nachfrage sucheAuswahl={sucheAuswahl} onSubmit={hanndleInput} />
      <SpracheListe sprache={eingegebeneSprache} />
    </>
  );
}

export default App;
