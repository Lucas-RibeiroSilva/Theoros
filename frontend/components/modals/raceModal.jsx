import { useState, useEffect } from "react";
import { getRaces } from "../../services/api";
import "../../styles/modals/raceModal.css";

export default function RaceModal({ onClose, onSelectRace }) {
    const [hoveredRace, setHoveredRace] = useState(null);
    const [races, setRaces] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchRaces = async () => {
            try {
                setLoading(true);
                const data = await getRaces();
                setRaces(data);
                setError(null);
            } catch (err) {
                setError("Erro ao carregar as raças");
                console.error("Erro ao buscar raças:", err);
            } finally {
                setLoading(false)
            }
        };
        
        

        fetchRaces();
    }, []);
    
    // ──────────────────────────────────────────────
    // Buscar raças
    // ──────────────────────────────────────────────
    const handleSelectRace = (race) => {
        const modifiers = race.modifiers.map(mod => ({
            attribute: mod.attribute,
            value: mod.value,
            display: mod.display
        }));

        onSelectRace(race.name, race.id, modifiers);
        onClose();
    };

    // ──────────────────────────────────────────────
    // Buscar imagem da raça
    // ──────────────────────────────────────────────
    const getImagePath = (raceName) => {
        return `/races/${raceName.toLowerCase()}.png`;
    };

    // ──────────────────────────────────────────────
    // Tela de carregamento
    // ──────────────────────────────────────────────
    if (loading) {
        return (
            <div className="loading-overlay" onClick={onClose}>
                <img id="loading" src="/loading.gif" alt="carragamento" />
                <h2 id="loading-text">Carregando</h2>
            </div>
        );
    }

    // ──────────────────────────────────────────────
    // Tela de erro
    // ──────────────────────────────────────────────
    if (error) {
        return (
            <div className="modal-races-overlay" onClick={onClose}>
                <div className="modal-race" onClick={(e) => e.stopPropagation()}>
                    <h2>Erro</h2>
                    <p>{error}</p>
                    <button onClick={onClose}>Fechar</button>
                </div>
            </div>
        );
    }

    return (

        <div className="modal-races-overlay" onClick={onClose}>

            <div className="modal-race" onClick={(e) => e.stopPropagation()}>

                <div className="modal-race-header">
                    <h2>Selecione uma Raça</h2>
                    <button id="race-close-btn" onClick={onClose}>✕</button>
                </div>

                <div className="race-options">
                    {races.map((race) => (
                        <div
                            key={race.id}
                            className="race-item"
                        >
                            <p>{race.name}</p>
                            <div
                                className="race-button-wrapper"
                                onMouseEnter={() => setHoveredRace(race.id)}
                                onMouseLeave={() => setHoveredRace(null)}
                            >
                                <button onClick={() => handleSelectRace(race)}>
                                    <img
                                        src={getImagePath(race.name)}
                                        alt={race.name}
                                        onError={(e) => {
                                            e.target.src = '/races/default.png';
                                        }}
                                    />
                                </button>

                                {hoveredRace === race.id && (
                                    <div className="race-tooltip">
                                        <h4>{race.name}</h4>
                                        <p className="race-description">{race.description}</p>
                                        <div className="race-modifiers">
                                            <strong>Modificadores:</strong>
                                            {race.modifiers.map((mod, index) => (
                                                <span key={index}>{mod.display}</span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                    ))}
                </div>
            </div>
        </div>
    );
}