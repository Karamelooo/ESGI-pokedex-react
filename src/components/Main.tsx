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

const Main: React.FC = () => {
  const [pokemons, setPokemons] = useState<Pokemon[]>([]);
  const [types, setTypes] = useState<PokemonType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchName, setSearchName] = useState('');
  const [selectedType, setSelectedType] = useState<number | ''>('');
  const [params, setParams] = useState<FetchParams>({
    page: 1,
    limit: 50
  });
  const [hasMore, setHasMore] = useState(true);
  const observer = useRef<IntersectionObserver | null>(null);
  const searchTimeout = useRef<number | null>(null);
  
  const isSearchMode = () => {
    return (params.name !== undefined && params.name !== '') || 
           (params.typeId !== undefined);
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
  }, [loading, hasMore, params.name, params.typeId]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchName(value);
    
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }
    
    searchTimeout.current = setTimeout(() => {
      if (value === '') {
        setParams(prev => {
          const newParams = { ...prev, page: 1 };
          delete newParams.name;
          return newParams;
        });
      } else {
        setParams(prev => ({
          ...prev,
          page: 1,
          name: value,
          limit: 150
        }));
      }
      setHasMore(!value);
    }, 500);
  };

  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSelectedType(value === '' ? '' : parseInt(value));
    
    setParams(prev => {
      const newParams = { ...prev, page: 1 };
      
      if (value === '') {
        delete newParams.typeId;
      } else {
        newParams.typeId = parseInt(value);
      }
      
      return newParams;
    });
    
    setHasMore(value === '');
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
        url.searchParams.append('types', typeId.toString());
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
      } catch (err) {
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
              placeholder="Rechercher un Pokémon..."
              value={searchName}
              onChange={handleSearchChange}
              className="search-input"
            />
          </div>
          
          <div className="type-filter">
            <select 
              value={selectedType} 
              onChange={handleTypeChange}
              className="type-select"
            >
              <option value="">Tous les types</option>
              {types.map(type => (
                <option key={type.id} value={type.id}>
                  {type.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        {isSearchMode() && (
          <div className="search-info">
            {params.name && <span>Nom : {params.name}</span>}
            {params.typeId && types.length > 0 && (
              <span>Type : {types.find(t => t.id === params.typeId)?.name}</span>
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
              >
                <img src={pokemon.image} alt={pokemon.name}/>
                <h3>{pokemon.name}</h3>
                <h4>#{pokemon.id}</h4>
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