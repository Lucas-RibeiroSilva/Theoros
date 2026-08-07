import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import Header from "../components/header"
import Loading from "../components/loading"

import { getCards } from "../services/api";

import FilterAltTwoToneIcon from "@mui/icons-material/FilterAltTwoTone";


import Tooltip from '@mui/material/Tooltip';

import "../styles/pages/searchCards.css"

export default function SearchCards({ handleLogout }) {
    const navigate = useNavigate();
    const [filterText, setFilterText] = useState("");
    const [cards, setCards] = useState([])
    const [showCardsFilters, setShowCardsFilters] = useState(false);
    const [loading, setLoading] = useState(true);
    const [currentFeaturedIndex, setCurrentFeaturedIndex] = useState(0);

    const [filters, setFilters] = useState({
        Gurps: false,
        DxD: false,
    });

    useEffect(() => {
        async function loadCards() {
            try {
                setLoading(true);
                const data = await getCards();
                setCards(data)
                if (data?.error) {
                    console.error(data.error);
                    return;
                }

            } catch (err) {
                console.error(err);
            } finally {

                setLoading(false);
            }
        }

        loadCards();
    }, []);

    const filtered = cards.filter((card) => {
        const name = card.name?.toLowerCase() ?? "";
        const matchesName = name.includes(filterText.toLowerCase());

        return matchesName;
    });

    const topThreeCards = [...filtered]
        .sort((a, b) => (b.ratingAverage || 0) - (a.ratingAverage || 0))
        .slice(0, 3);

    useEffect(() => {
        if (currentFeaturedIndex >= topThreeCards.length) {
            setCurrentFeaturedIndex(0);
        }
    }, [currentFeaturedIndex, topThreeCards.length]);

    function showPreviousCard() {
        if (topThreeCards.length === 0) return;

        setCurrentFeaturedIndex((prev) =>
            prev === 0 ? topThreeCards.length - 1 : prev - 1
        );
    }

    function showNextCard() {
        if (topThreeCards.length === 0) return;

        setCurrentFeaturedIndex((prev) =>
            prev === topThreeCards.length - 1 ? 0 : prev + 1
        );
    }

    // ──────────────────────────────────────────────
    // Estrelas para avaliação
    // ──────────────────────────────────────────────
    function RatingStars({ rating = 0 }) {
        const rounded = Math.round(rating * 2) / 2;
        const fullStars = Math.floor(rounded);
        const hasHalfStar = rounded % 1 !== 0;
        const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

        return (
            <>
                {[...Array(fullStars)].map((_, index) => (
                    <img src="/stars/full_star.webp" id="star" key={`full-${index}`} />
                ))}
                {hasHalfStar && <img src="/stars/half_star.webp" id="star-half" />}
                {[...Array(emptyStars)].map((_, index) => (
                    <img src="/stars/null_star.webp" id="star-empty" key={`empty-${index}`} />
                ))}
            </>
        );
    }

    // ──────────────────────────────────────────────
    // Mostrar Filtros
    // ──────────────────────────────────────────────
    function showFilters() {
        setShowCardsFilters((prev) => !prev);
    }

    // ──────────────────────────────────────────────
    // Habilitar Filtro
    // ──────────────────────────────────────────────
    function toggleFilter(card) {
        setFilters((prev) => ({
            ...prev,
            [card]: !prev[card],
        }));
    }

    if (loading) {
        return (
            <Loading />
        );
    }

    return (
        <>
            {/* Header (Cabeçalho) */}
            <Header handleLogout={handleLogout} />



            {/* Carrossel de fichas em destaque */}
            <h2 id="search-title">Fichas em Destaque</h2>
            {topThreeCards.length > 0 && (
                <div className="featured-carousel">

                    <img src="/seta.png" className="carousel-arrow-left" role="button" onClick={showPreviousCard} aria-label="Ficha anterior" />

                    <ul className="featured-card">
                        <li
                            key={topThreeCards[currentFeaturedIndex].id}
                            className="featured-card-content"
                            onClick={() => navigate(`/card/${topThreeCards[currentFeaturedIndex].id}`)}
                        >
                            <img src={topThreeCards[currentFeaturedIndex].image} alt="" className="featured-card-image" />

                            <div className="featured-card-text-content">
                                <p className="featured-card-title">{topThreeCards[currentFeaturedIndex].name}</p>
                                <p className="featured-card-history">{topThreeCards[currentFeaturedIndex].history?.substring(0, 130)}...</p>
                                <div className="featured-rating-search-card">
                                    <RatingStars rating={topThreeCards[currentFeaturedIndex].ratingAverage} />
                                </div>
                            </div>
                        </li>
                    </ul>

                    <img src="/seta.png" className="carousel-arrow-right" role="button" onClick={showNextCard} aria-label="Próxima ficha" />
                </div>
            )}

            <hr id="search-hr" />

            {/* Pesquisa de fichas */}
            <h2 id="search-title">Pesquisar Fichas</h2>
            <div className="search-top">
                <input
                    type="text"
                    placeholder="Digite o nome ou ID da Ficha"
                    id="search-input"
                    value={filterText}
                    onChange={(e) => setFilterText(e.target.value)}
                />

                {/* Icone de filtro */}
                <Tooltip title="Filtrar Pesquisa" arrow>
                    <FilterAltTwoToneIcon id="filter-search-icon" onClick={showFilters} />
                </Tooltip>
            </div>

            {showCardsFilters && (
                <div className="filters">
                    <button className={filters.Gurps ? "active" : ""} onClick={() => toggleFilter("Gurps")}>GURPS</button>
                    <button className={filters.DxD ? "active" : ""} onClick={() => toggleFilter("D&D")}>D&D</button>
                </div>
            )}


            <div className="list-cards-search">
                {/* Lista das fichas */}
                <ul className="selected-search-list">
                    {filtered.length === 0 ? (
                        <li className="empty-search-list-message">Nenhuma Ficha Encontrada</li>
                    ) : (
                        filtered.map((card) => (

                            <li key={card.id} className="selected-search-item" onClick={() => navigate(`/card/${card.id}`)}>
                                <div className="selected-search-info">
                                    <img src={card.image} alt="" id="img-search-card" />


                                    <div className="card-name">
                                        <p id="search-card-name">{card.name}</p>
                                        <RatingStars id="stars-rating-created" rating={card.ratingAverage} />
                                    </div>

                                    <div className="rating-search-card">

                                    </div>
                                </div>
                            </li>
                        ))
                    )}
                </ul>
            </div>
            <hr id="search-hr" />
        </>
    )
}