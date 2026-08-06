import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

import { getFavoritesCards, removeFavoriteCard } from "../../../services/api";
import { jwtDecode } from "jwt-decode";

import Header from "../../header";
import Loading from "../../loading";

import "../../../styles/sections/favoritesCards.css"

export default function FavoritesSection({ onLoading }) {
  const [favorites, setFavorites] = useState([]);
  const { userId } = useParams();
  const [isOwnProfile, setIsOwnProfile] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        onLoading(true);

        const loggedUserId = getUserIdFromToken();

        if (!loggedUserId) {
          console.error("Usuário não autenticado");
          setLoading(false);
          return;
        }

        // Serve para saber qual id usar (loggedUserId = ID do próprio usuário | userId = ID do usuário que deseja ver o perfil)
        const targetUserId = userId || loggedUserId;

        // Verifica se é o próprio perfil
        setIsOwnProfile(targetUserId === loggedUserId);

        const data = await getFavoritesCards(targetUserId);

        if (data?.error) {
          console.error(data.error);
          onLoading(false);
          return;
        }

        setFavorites(data || []);
        onLoading(false);

      } catch (error) {
        console.error("Erro:", error);
        onLoading(false);
      }
    }

    load();
  }, [userId]);

  const navigate = useNavigate();

  // ──────────────────────────────────────────────
  // Pegar o ID do usuário através do token
  // ──────────────────────────────────────────────
  function getUserIdFromToken() {
    const token = localStorage.getItem('token');

    if (!token) {
      return null;
    }

    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        return null;
      }

      const payload = JSON.parse(atob(parts[1]));
      return payload.id;
    } catch (error) {
      console.error('Erro ao decodificar token:', error);
      return null;
    }
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

  async function removeFavorite(cardId) {
    try {
      const userId = getUserIdFromToken();

      if (!userId) {
        console.error("Usuário não autenticado");
        return;
      }

      await removeFavoriteCard(userId, cardId);

      // Atualiza o estado local (remove o item da lista)
      setFavorites(prevFavorites =>
        prevFavorites.filter(favorite => favorite.card.id !== cardId)
      );

    } catch (error) {
      console.error("Erro ao remover favorito:", error);
    }
  }

  // ──────────────────────────────────────────────
  // Icones
  // ──────────────────────────────────────────────

  function getIcon(race) {
    if (race === "Elfo") {
      return <img src="/races/elfo.png" alt="Elfo" />;
    }
    if (race === "Humano") {
      return <img src="/races/humano.png" alt="Humano" />;
    }
    if (race === "Anão") {
      return <img src="/races/anão.png" alt="Anão" />;
    }
    if (race === "Orc") {
      return <img src="/races/ogro.png" alt="Orc" />;
    }
    if (race === "Homem Fera") {
      return <img src="/races/homem fera.png" alt="Orc" />;
    }
    if (race === "Morto Vivo") {
      return <img src="/races/morto vivo.png" alt="Orc" />;
    }
    if (race === "Vampiro") {
      return <img src="/races/vampiro.png" alt="Orc" />;
    }
  }

  return (
    <>
      <h2>Fichas Favoritadas</h2>

      <ul className="list-favorites-cards">
        {favorites.length > 0 ? (
          favorites.map((favorite) => {
            return (
              <li key={favorite.id} className={"item-favorites"} onClick={() => navigate(`/card/${favorite.card.id}`)}>
                <div className="top-favorites">
                  <img src={favorite.card.image} alt="" id="img-favorite" />

                  <div className="info-favorites">
                    <p id="favorite-card-name">{favorite.card.name}</p>

                    <p id="favorite-card-history" length="100">{favorite.card?.history}</p>

                    <div className="buttons-favorites">
                      <button id="download-favorite-card-btn">Download</button>
                      {isOwnProfile && (
                        <button id="delete-favorite-card-btn" onClick={(e) => { e.stopPropagation(); removeFavorite(favorite.card.id)  }}>Remover</button>
                      )}
                    </div>

                    <div className="race-favorite-card">
                      <p id="race-favorite-card">Raça:</p>
                      {getIcon(favorite.card.race?.name)}
                    </div>

                    <div className="rating-favorites">
                      <RatingStars id="stars-rating-favorites" rating={favorite.card?.ratingAverage} />
                    </div>
                  </div>
                </div>
              </li>
            );
          })
        ) : (
          <p id="empty-list-favorites-cards">Nenhum favorito encontrado</p>
        )}
      </ul>
    </>
  );
}