import { useState } from 'react';
import './App.css'
import Header from './components/Header'
import Main from './components/Main'
import PokemonDetail from './components/PokemonDetail'

function App() {
  const [selectedPokemonId, setSelectedPokemonId] = useState<number | null>(null);

  const handlePokemonSelect = (id: number) => {
    setSelectedPokemonId(id);
  };

  const handleBackToList = () => {
    setSelectedPokemonId(null);
  };

  return (
    <>
      <Header />
      {selectedPokemonId ? (
        <PokemonDetail 
          pokemonId={selectedPokemonId} 
          onBack={handleBackToList}
          onEvolutionSelect={handlePokemonSelect}
        />
      ) : (
        <Main onPokemonSelect={handlePokemonSelect} />
      )}
    </>
  )
}

export default App
