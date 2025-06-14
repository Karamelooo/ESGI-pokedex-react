import React, { useEffect, useState, useRef, useCallback } from 'react';

interface Pokemon {
  id: number;
  name: string;
  image: string;
  types: {
    id: number;
    name: string;
    image: string;
  }[];
}

interface PokemonType {
  id: number;
  name: string;
  image: string;
}

interface FetchParams {
  page: number;
  limit: number;
  typeId?: number;
  types?: number[];
  name?: string;
}

interface MainProps {
  onPokemonSelect: (id: number) => void;
  listState: {
    searchName: string;
    selectedTypes: number[];
    params: {
      page: number;
      limit: number;
      types?: number[];
      name?: string;
    };
    scrollPosition: number;
  };
  onListStateChange: (newState: Partial<any>) => void;
}

const Main: React.FC<MainProps> = ({ 
  onPokemonSelect, 
  listState, 
  onListStateChange 
}) => {
  const [pokemons, setPokemons] = useState<Pokemon[]>([]);
  const [types, setTypes] = useState<PokemonType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchName, setSearchName] = useState(listState.searchName);
  const [selectedTypes, setSelectedTypes] = useState<number[]>(listState.selectedTypes);
  const [params, setParams] = useState(listState.params);
  const [hasMore, setHasMore] = useState(true);
  const observer = useRef<IntersectionObserver | null>(null);
  const searchTimeout = useRef<number | null>(null);
  
  const isSearchMode = () => {
    return (params.name !== undefined && params.name !== '') || 
           (params.types !== undefined && params.types.length > 0);
  };
  
  const lastPokemonRef = useCallback((node: HTMLDivElement) => {
    if (loading || isSearchMode()) return;
    
    if (observer.current) observer.current.disconnect();
    
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setParams(prev => ({ ...prev, page: prev.page + 1 }));
      }
    });
    
    if (node) observer.current.observe(node);
  }, [loading, hasMore, params.name, params.types]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchName(value);
    
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }
    
    searchTimeout.current = setTimeout(() => {
      let newParams;
      if (value === '') {
        newParams = {
          ...params,
          page: 1
        };
        delete newParams.name;
      } else {
        newParams = {
          ...params,
          page: 1,
          name: value,
          limit: 150
        };
      }
      
      setParams(newParams);
      setHasMore(!value);
      
      // Mettre à jour l'état global
      onListStateChange({
        searchName: value,
        params: newParams
      });
    }, 500);
  };

  const handleTypeToggle = (typeId: number) => {
    const isSelected = selectedTypes.includes(typeId);
    
    let newSelectedTypes: number[];
    if (isSelected) {
      newSelectedTypes = selectedTypes.filter(id => id !== typeId);
    } else {
      newSelectedTypes = [...selectedTypes, typeId];
    }
    
    setSelectedTypes(newSelectedTypes);
    
    let newParams = { ...params, page: 1 };
    
    if (newSelectedTypes.length === 0) {
      delete newParams.types;
    } else {
      newParams.types = newSelectedTypes;
    }
    
    setParams(newParams);
    setHasMore(newSelectedTypes.length === 0);
    
    onListStateChange({
      selectedTypes: newSelectedTypes,
      params: newParams
    });
  };

  const buildUrl = (params: FetchParams) => {
    const url = new URL('https://nestjs-pokedex-api.vercel.app/pokemons');
    
    url.searchParams.append('page', params.page.toString());
    url.searchParams.append('limit', params.limit.toString());
    
    if (params.typeId) {
      url.searchParams.append('typeId', params.typeId.toString());
    }
    
    if (params.types && params.types.length > 0) {
      params.types.forEach(typeId => {
        url.searchParams.append('types[]', typeId.toString());
      });
    }
    
    if (params.name) {
      url.searchParams.append('name', params.name);
    }
    
    return url.toString();
  };

  useEffect(() => {
    const fetchTypes = async () => {
      try {
        const response = await fetch('https://nestjs-pokedex-api.vercel.app/types');
        if (!response.ok) {
          throw new Error('Erreur lors du chargement des types');
        }
        const data = await response.json();
        setTypes(data);
      }
      catch (err) {
        console.error('Erreur lors du chargement des types:', err);
      }
    };

    fetchTypes();
  }, []);

  useEffect(() => {
    const fetchPokemons = async () => {
      setLoading(true);
      try {
        const url = buildUrl(params);
        const response = await fetch(url);
        
        if (!response.ok) {
          throw new Error('Erreur lors du chargement des données');
        }
        
        const data = await response.json();
        
        if (isSearchMode()) {
          setPokemons(data);
        }
        else {
          setPokemons(prev => params.page === 1 ? data : [...prev, ...data]);
        }
      }
      catch (err) {
        setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      }
      finally {
        setLoading(false);
      }
    };

    fetchPokemons();
  }, [params]);

  if (error) return <div>Erreur: {error}</div>;

  return (
    <div className="pokedexContainer">
      <div className="filters-container">
        <div className="search-container">
          <div className="search-input-wrapper">
            <input
              type="text"
              placeholder="Rechercher un Pokémon par nom"
              value={searchName}
              onChange={handleSearchChange}
              className="search-input"
            />
          </div>
        </div>
        
        <div className="limit-selector">
          <label htmlFor="limit-select">Pokémons par requête : </label>
          <select 
            id="limit-select" 
            value={params.limit}
            onChange={(e) => {
              const newLimit = parseInt(e.target.value);
              const newParams = { ...params, page: 1, limit: newLimit };
              setParams(newParams);
              onListStateChange({ params: newParams });
            }}
            className="limit-select"
          >
            <option value="10">10</option>
            <option value="20">20</option>
            <option value="50">50</option>
            <option value="100">100</option>
          </select>
        </div>
        
        <div className="types-filter">
          <div className="types-buttons">
            {types.map(type => (
              <button
                key={type.id}
                className={`type-button ${selectedTypes.includes(type.id) ? 'selected' : ''}`}
                onClick={() => handleTypeToggle(type.id)}
              >
                <img 
                  src={type.image} 
                  alt={type.name} 
                  className="type-button-icon" 
                />
                <span>{type.name}</span>
              </button>
            ))}
          </div>
        </div>
        
        {isSearchMode() && (
          <div className="search-info">
            {params.name && <span>Nom : {params.name}</span>}
            {params.types && params.types.length > 0 && (
              <span>
                Types : {params.types.map(typeId => {
                  const typeName = types.find(t => t.id === typeId)?.name;
                  return typeName;
                }).join(', ')}
              </span>
            )}
          </div>
        )}
      </div>
      
      {pokemons.length === 0 && !loading ? (
        <div className="no-results">Aucun Pokémon trouvé</div>
      ) : (
        <div className="pokemonContainer">
          {pokemons.map((pokemon, index) => {
            const isLastItem = index === pokemons.length - 1;
            return (
              <div 
                key={pokemon.id} 
                ref={isSearchMode() ? undefined : (isLastItem ? lastPokemonRef : undefined)}
                className="pokemon-card"
                onClick={() => onPokemonSelect(pokemon.id)}
              >
                <img src={pokemon.image} alt={pokemon.name}/>
                <h3 className="pokemon-name">{pokemon.name}</h3>
                <h4 className="pokemon-id">#{pokemon.id}</h4>
                <div className="pokemon-types">
                  {pokemon.types && pokemon.types.map((type) => (
                    <div key={type.id} className="pokemon-type">
                      <img src={type.image} alt={type.name} className="type-icon" />
                      <span>{type.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
      {!isSearchMode() && loading && <div className="loading">Chargement...</div>}
    </div>
  );
};

export default Main;