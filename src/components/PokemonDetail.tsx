import React, { useEffect, useState } from 'react';
import '../App.css';

interface PokemonType {
  id: number;
  name: string;
  image: string;
}

interface Pokemon {
  id: number;
  pokedexId: number;
  name: string;
  image: string;
  sprite: string;
  stats: {
    HP: number;
    speed: number;
    attack: number;
    defense: number;
    specialAttack: number;
    specialDefense: number;
  };
  types: PokemonType[];
  generation: number;
  evolutions?: {
    name: string;
    pokedexId: number;
  }[];
}

interface PokemonDetailProps {
  pokemonId: number;
  onBack: () => void;
}

const PokemonDetail: React.FC<PokemonDetailProps> = ({ pokemonId, onBack }) => {
  const [pokemon, setPokemon] = useState<Pokemon | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPokemonDetail = async () => {
      setLoading(true);
      try {
        const response = await fetch(`https://nestjs-pokedex-api.vercel.app/pokemons/${pokemonId}`);
        if (!response.ok) {
          throw new Error('Erreur lors du chargement des données du Pokémon');
        }
        const data = await response.json();
        setPokemon(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      } finally {
        setLoading(false);
      }
    };

    fetchPokemonDetail();
  }, [pokemonId]);

  if (loading) return <div className="loading">Chargement...</div>;
  if (error) return <div className="error">Erreur: {error}</div>;
  if (!pokemon) return <div className="no-data">Aucune donnée disponible</div>;

  return (
    <div className="pokemon-detail-container">
      <button className="back-button" onClick={onBack}>
        &larr; Retour
      </button>
      
      <div className="pokemon-detail-card">
        <div className="pokemon-detail-header">
          <img src={pokemon.image} alt={pokemon.name} className="pokemon-detail-image" />
          <div className="pokemon-detail-info">
            <h1 className="pokemon-detail-name">{pokemon.name}</h1>
            <h2 className="pokemon-detail-id">#{pokemon.pokedexId}</h2>
            <h3 className="pokemon-detail-generation">Génération: {pokemon.generation}</h3>
            <div className="pokemon-detail-types">
              {pokemon.types.map(type => (
                <div key={type.id} className="pokemon-type">
                  <img src={type.image} alt={type.name} className="type-icon" />
                  <span>{type.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        {pokemon.evolutions && pokemon.evolutions.length > 0 && (
          <div className="pokemon-detail-evolutions">
            <h3>Évolutions</h3>
            <div className="evolutions-list">
              {pokemon.evolutions.map(evolution => (
                <div key={evolution.pokedexId} className="evolution-item">
                  <span>{evolution.name}</span>
                  <span className="evolution-id">#{evolution.pokedexId}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        <div className="pokemon-detail-stats">
          <h3>Statistiques</h3>
          <div className="stat-grid">
            <div className="stat-item">
              <span className="stat-label">PV</span>
              <span className="stat-value">{pokemon.stats.HP}</span>
              <div className="stat-bar">
                <div className="stat-fill hp" style={{ width: `${(pokemon.stats.HP / 255) * 100}%` }}></div>
              </div>
            </div>
            <div className="stat-item">
              <span className="stat-label">Attaque</span>
              <span className="stat-value">{pokemon.stats.attack}</span>
              <div className="stat-bar">
                <div className="stat-fill attack" style={{ width: `${(pokemon.stats.attack / 255) * 100}%` }}></div>
              </div>
            </div>
            <div className="stat-item">
              <span className="stat-label">Défense</span>
              <span className="stat-value">{pokemon.stats.defense}</span>
              <div className="stat-bar">
                <div className="stat-fill defense" style={{ width: `${(pokemon.stats.defense / 255) * 100}%` }}></div>
              </div>
            </div>
            <div className="stat-item">
              <span className="stat-label">Vitesse</span>
              <span className="stat-value">{pokemon.stats.speed}</span>
              <div className="stat-bar">
                <div className="stat-fill speed" style={{ width: `${(pokemon.stats.speed / 255) * 100}%` }}></div>
              </div>
            </div>
            <div className="stat-item">
              <span className="stat-label">Attaque Spé.</span>
              <span className="stat-value">{pokemon.stats.specialAttack}</span>
              <div className="stat-bar">
                <div className="stat-fill special-attack" style={{ width: `${(pokemon.stats.specialAttack / 255) * 100}%` }}></div>
              </div>
            </div>
            <div className="stat-item">
              <span className="stat-label">Défense Spé.</span>
              <span className="stat-value">{pokemon.stats.specialDefense}</span>
              <div className="stat-bar">
                <div className="stat-fill special-defense" style={{ width: `${(pokemon.stats.specialDefense / 255) * 100}%` }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PokemonDetail;