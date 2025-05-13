import { useState } from 'react';
import './App.css'
import Header from './components/Header'
import Main from './components/Main'
import PokemonDetail from './components/PokemonDetail'

interface ListState {
  searchName: string;
  selectedTypes: number[];
  params: {
    page: number;
    limit: number;
    types?: number[];
    name?: string;
  };
  scrollPosition: number;
}

function App() {
  const [selectedPokemonId, setSelectedPokemonId] = useState<number | null>(null);
  const [pokemonHistory, setPokemonHistory] = useState<number[]>([]);
  const [listState, setListState] = useState<ListState>({
    searchName: '',
    selectedTypes: [],
    params: {
      page: 1,
      limit: 50
    },
    scrollPosition: 0
  });

  const handlePokemonSelect = (id: number) => {
    if (selectedPokemonId !== null) {
      setPokemonHistory(prev => [...prev, selectedPokemonId]);
    }
    else {
      setListState(prev => ({
        ...prev,
        scrollPosition: window.scrollY
      }));
    }
    
    setSelectedPokemonId(id);
  };

  const handleBackToList = () => {
    if (pokemonHistory.length > 0) {
      const previousPokemonId = pokemonHistory[pokemonHistory.length - 1];
      setSelectedPokemonId(previousPokemonId);
      
      setPokemonHistory(prev => prev.slice(0, -1));
    }
    else {
      setSelectedPokemonId(null);
      
      setTimeout(() => {
        window.scrollTo(0, listState.scrollPosition);
      }, 0);
    }
  };

  const handleListStateChange = (newState: Partial<ListState>) => {
    setListState(prev => ({
      ...prev,
      ...newState
    }));
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
        <Main 
          onPokemonSelect={handlePokemonSelect}
          listState={listState}
          onListStateChange={handleListStateChange}
        />
      )}
    </>
  )
}

export default App
