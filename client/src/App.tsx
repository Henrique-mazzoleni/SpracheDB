import { useState } from 'react';
import './App.css';
import Nachfrage from './components/Nachfrage';
import SpracheListe from './components/SpracheListe';

function App() {
  const [eingegebeneSprache, setEingegebeneSprache] = useState('');

  const hanndleInput = (eingabe: string) => {
    setEingegebeneSprache(eingabe);
  };

  return (
    <>
      <h1>Programmiersprachen</h1>
      <Nachfrage onSubmit={hanndleInput} />
      <SpracheListe sprache={eingegebeneSprache} />
    </>
  );
}

export default App;
