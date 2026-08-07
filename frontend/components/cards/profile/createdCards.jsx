import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

import { jwtDecode } from "jwt-decode";

import Header from "../../header";
import Loading from "../../loading";

import { getUserCards, deleteCard, getMyUserInfo } from "../../../services/api";

import "../../../styles/sections/createdCards.css"

export default function CreatedSection({ onLoading, openConfirmDialog }) {
  const [createds, setCreateds] = useState([]);
  const { userId } = useParams();
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

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

        // Verifica se o usuário é adminstrador através do próprio perfil logado
        const loggedUser = await getMyUserInfo();

        if (loggedUser?.admin) {
          setIsAdmin(true);
        }

        // Busca os dados do usuário
        const data = await getUserCards(targetUserId);

        if (data?.error) {
          console.error(data.error);
          onLoading(false);
          return;
        }

        setCreateds(data || []);
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

  async function deleteMyCard(cardId) {
    try {
      await deleteCard(cardId)

      setCreateds(prevCreateds =>
        prevCreateds.filter(created => created.id !== cardId)
      );

    } catch (error) {
      console.error("Erro ao excluir ficha:", error);
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
      <h2>Fichas Criadas</h2>

      <ul className="list-created-cards">
        {createds.length > 0 ? (
          createds.map((created) => {
            return (
              <li key={created.id} className={"item-created"} onClick={() => navigate(`/card/${created.id}`)}>
                <div className="top-created">
                  <img src={created.image} alt="" id="img-created" />

                  <div className="info-created">
                    <p id="created-card-name">{created.name}</p>

                    <p id="created-card-history" length="100">{created.history}</p>

                    <div className="buttons-created">
                      <button id="download-created-card-btn">Download</button>
                      {(isOwnProfile || isAdmin) && (
                        <button
                        id="delete-created-card-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          openConfirmDialog(created.id);
                        }}
                      >
                        Excluir
                      </button>
                      )}
                    </div>

                    <div className="race-created-card">
                      <p id="race-created-card">Raça:</p>
                      {getIcon(created.race?.name)}
                    </div>

                    <div className="rating-created">
                      <RatingStars id="stars-rating-created" rating={created.ratingAverage} />
                    </div>
                  </div>
                </div>
              </li>
            );
          })
        ) : (
          <p id="empty-list-createds-cards">Nenhuma ficha encontrada</p>
        )}
      </ul>

    </>
  );
}