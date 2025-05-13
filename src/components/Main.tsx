import React, { useEffect, useState } from 'react';

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

const Main: React.FC = () => {
  const [pokemons, setPokemons] = useState<Pokemon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPokemons = async () => {
      try {
        const response = await fetch('https://nestjs-pokedex-api.vercel.app/pokemons');
        if (!response.ok) {
          throw new Error('Erreur lors du chargement des données');
        }
        const data = await response.json();
        setPokemons(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      } finally {
        setLoading(false);
      }
    };

    fetchPokemons();
  }, []);

  if (loading) return <div>Chargement...</div>;
  if (error) return <div>Erreur: {error}</div>;

  return (
    <div className="pokedexContainer">
      <div className="pokemonContainer">
        {pokemons.map((pokemon) => (
          <div key={pokemon.id}>
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
        ))}
      </div>
    </div>
  );
};

export default Main;