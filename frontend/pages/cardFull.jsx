import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";

import { getCardById, favoriteCard, getUserInfo, getRatingsByCard } from "../services/api";
import Header from "../components/header";
import Loading from "../components/loading";
import RatingModal from "../components/modals/ratingModal";
import LoginModal from "../components/modals/loginModal";

import "../styles/pages/cardFull.css";

// Componente de estrelas (pode ser movido para um arquivo separado)
function RatingStars({ rating = 0 }) {
  const rounded = Math.round(rating * 2) / 2;
  const fullStars = Math.floor(rounded);
  const hasHalfStar = rounded % 1 !== 0;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  return (
    <>
      {[...Array(fullStars)].map((_, index) => (
        <img src="/stars/full_star.webp" alt="estrela cheia" key={`full-${index}`} />
      ))}
      {hasHalfStar && <img src="/stars/half_star.webp" alt="meia estrela" />}
      {[...Array(emptyStars)].map((_, index) => (
        <img src="/stars/null_star.webp" alt="estrela vazia" key={`empty-${index}`} />
      ))}
    </>
  );
}

export default function CardFull({ handleLogout }) {
  const { id } = useParams();
  const navigate = useNavigate();

  const [card, setCard] = useState(null);
  const [commentarys, setCommentarys] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showAlertFavorite, setShowAlertFavorite] = useState(false);
  const [isClosingAlert, setIsClosingAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");

  const timeoutRef = useRef(null);

  const token = localStorage.getItem("token");
  const currentUser = token ? jwtDecode(token) : null;

  // Efeito para carregar os dados da ficha
  useEffect(() => {
    async function loadCard() {
      try {
        setLoading(true);
        const data = await getCardById(id);
        const dataProfile = await getUserInfo(data?.userId);
        const dataCommentarys = await getRatingsByCard(id);
        setCard(data);
        setProfile(dataProfile);
        setCommentarys(dataCommentarys);
      } catch (error) {
        console.error("Erro ao carregar ficha:", error);
      } finally {
        setLoading(false);
      }
    }

    loadCard();
  }, [id]);

  // Efeito para limpar o timeout ao desmontar
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, []);

  // Função para exibir alerta com fechamento automático
  const showAlertWithTimeout = (message, duration = 3000) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    setAlertMessage(message);
    setIsClosingAlert(false);
    setShowAlertFavorite(true);

    timeoutRef.current = setTimeout(() => {
      setIsClosingAlert(true);
      setTimeout(() => {
        setShowAlertFavorite(false);
        setIsClosingAlert(false);
      }, 300);
      timeoutRef.current = null;
    }, duration);
  };

  // Fecha o alerta manualmente
  const closeAlert = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setIsClosingAlert(true);
    setTimeout(() => {
      setShowAlertFavorite(false);
      setIsClosingAlert(false);
    }, 300);
  };

  const isOwner = currentUser?.id === card?.userId;

  async function addFavorite(userId, cardId) {
    if (userId == null) {
      setShowLoginModal(true);
      return;
    }

    try {
      const response = await favoriteCard(userId, cardId);
      if (response && response.error) {
        showAlertWithTimeout(`${response.error}`);
      } else {
        showAlertWithTimeout("Ficha salva com sucesso!");
      }
    } catch (error) {
      console.error("Erro ao salvar ficha:", error);
      if (error.response) {
        showAlertWithTimeout(`Erro do servidor: ${error.response.data?.error || error.message}`);
      } else if (error.message) {
        showAlertWithTimeout(`Erro: ${error.message}`);
      } else {
        showAlertWithTimeout('Erro ao salvar a ficha. Tente novamente.');
      }
    }
  }

  function closeLoginModal() {
    setShowLoginModal(false);
  }

  function openRatingModal() {
    setShowRatingModal(true);
  }

  function closeRatingModal() {
    setShowRatingModal(false);
  }

  const advantages = card?.traits?.filter((t) => t.trait.isAdvantage === true) || [];
  const disadvantages = card?.traits?.filter((t) => t.trait.isAdvantage === false) || [];

  if (loading) {
    return <Loading />;
  }

  return (
    <>
      <Header handleLogout={handleLogout} />

      <div className="background-card">
      <div className="card-main">
        <img
          id="img-profile-card"
          src={profile?.image}
          alt="avatar do perfil"
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/profile/${profile?.id}`);
          }}
        />
        <h2 id="name-profile-card">Criador: {profile?.username}</h2>
        <h2 className="card-title">{card?.name}</h2>

        <div className="card-actions">
          {isOwner && (
            <button id="edit-btn" onClick={() => navigate(`/edit/${card?.id}`)}>
              Editar Card
            </button>
          )}
          {!isOwner && (
            <div className="card-actions-noOwner">
              <button id="rate-btn" onClick={openRatingModal}>
                Avaliar
              </button>
              <button
                id="favorite-btn"
                onClick={() => addFavorite(currentUser?.id, id)}
              >
                Favoritar
              </button>
            </div>
          )}
        </div>

        <div className="sub-card-main">
          <div id="image-container">
            {!card?.image && <p>Sem imagem</p>}
            {card?.image && (
              <img
                id="character-image"
                src={card?.image}
                alt="Preview do personagem"
              />
            )}
          </div>

          <div className="card-infos">
            <p id="name-card">Nome: {card?.name}</p>
            <p id="gender-card">Gênero: {card?.gender}</p>
            <p id="height-card">Altura: {card?.height}</p>
            <p id="age-card">Idade: {card?.age}</p>
            <p id="race-card">Raça: {card?.race?.name ?? ""}</p>
          </div>

          <div className="card-ratings">
            <p>Avaliações:</p>
            <div className="stars">
              <RatingStars rating={card?.ratingAverage} />
              <span>{card?.ratingAverage?.toFixed(1)}</span>
            </div>
          </div>
        </div>

        <div className="sub-card-main-2">
          <div className="card-status">
            <p id="strength">Força (ST): {card?.strength}</p>
            <p id="life">Vida (PV): {card?.life}</p>
            <p id="dexterity">Destreza (DX): {card?.dexterity}</p>
            <p id="health">Saúde (HP): {card?.health}</p>
            <p id="fatigue">Fadiga (HT): {card?.fatigue}</p>
            <p id="intelligence">Inteligência (IQ): {card?.intelligence}</p>
            <p id="perception">Percepção (Per): {card?.perception}</p>
            <p id="willing">Vontade (Von): {card?.willing}</p>
          </div>

          <div className="history-card">
            <p id="history-title">História:</p>
            <p id="history">{card?.history}</p>
          </div>

          <div className="alignment-card">
            <p id="alignment">Alinhamento: {card?.alignment}</p>
          </div>
        </div>

        <div className="sub-card-main-3">
          {advantages.length > 0 && (
            <div className="card-traits">
              <p id="advantages-title">Vantagens:</p>
              {advantages.map((item) => (
                <div key={item.id} className="card-traits-info">
                  <p id="trait-name">{item.trait.name}</p>
                  <p id="trait-level">Nível: {item.level}</p>
                </div>
              ))}
            </div>
          )}

          {disadvantages.length > 0 && (
            <div className="card-traits">
              <p id="disadvantages-title">Desvantagens:</p>
              {disadvantages.map((item) => (
                <div key={item.id} className="card-traits-info">
                  <p id="trait-name">{item.trait.name}</p>
                  <p id="trait-level">Nível: {item.level}</p>
                </div>
              ))}
            </div>
          )}

          {card?.expansions?.length > 0 && (
            <div className="card-expansions">
              <p id="expansions-title">Ampliações:</p>
              {card.expansions.map((item) => (
                <div key={item.id} className="card-expansions-info">
                  <p id="expansion-name">{item.expansion.name}</p>
                  <p id="expansion-level">Nível: {item.level}</p>
                </div>
              ))}
            </div>
          )}

          {card?.limitations?.length > 0 && (
            <div className="card-limitations">
              <p id="limitations-title">Limitações:</p>
              {card.limitations.map((item) => (
                <div key={item.id} className="card-limitations-info">
                  <p id="limitation-name">{item.limitation.name}</p>
                  <p id="limitation-level">Nível: {item.level}</p>
                </div>
              ))}
            </div>
          )}

          {card?.expertises?.length > 0 && (
            <div className="card-expertises">
              <p id="expertises-title">Perícias:</p>
              {card.expertises.map((item) => (
                <div key={item.id} className="card-expertises-info">
                  <p id="expertise-name">{item.expertise.name}</p>
                  <p id="expertise-level">Nível: {item.level}</p>
                </div>
              ))}
            </div>
          )}

          {card?.techniques?.length > 0 && (
            <div className="card-techniques">
              <p id="techniques-title">Técnicas:</p>
              {card.techniques.map((item) => (
                <div key={item.id} className="card-techniques-info">
                  <p id="technique-name">{item.technique.name}</p>
                  <p id="technique-level">Nível: {item.level}</p>
                </div>
              ))}
            </div>
          )}

          {card?.magics?.length > 0 && (
            <div className="card-magics">
              <p id="magics-title">Mágias:</p>
              {card.magics.map((item) => (
                <div key={item.id} className="card-magics-info">
                  <p id="magic-name">{item.magic.name}</p>
                  <p id="magic-level">Nível: {item.level}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      </div>

      <h2 id="title-commentarys">Comentários</h2>

      <div className="card-main-4">
        <ul className="list-commentarys-card">
          {commentarys && commentarys.length > 0 ? (
            commentarys.map((commentary) => (
              <li
                key={commentary.id}
                className="commentary"
                onClick={() => navigate(`/profile/${commentary.userId}`)}
              >
                <div className="top-commentary">
                  <img
                    src={commentary.user?.image}
                    alt="avatar do usuário"
                    id="img-commentary"
                  />
                  <div className="info-commentary">
                    <p id="commentary-user-name">{commentary.user?.username}</p>
                    <p id="commentary-user">{commentary.commentary}</p>
                    <div className="rating-commentary">
                      <RatingStars rating={commentary?.score} />
                    </div>
                  </div>
                </div>
              </li>
            ))
          ) : (
            <p id="empty-list-commentarys">Não possui comentários</p>
          )}
        </ul>
      </div>

      {showRatingModal && (
        <RatingModal onClose={closeRatingModal} cardId={card.id} />
      )}

      {showLoginModal && <LoginModal onClose={closeLoginModal} />}
      

      {showAlertFavorite && (
        <div className={`popup-alert-favorite-overlay ${isClosingAlert ? "closing" : ""}`} onClick={closeAlert}>
          <div className={`alert-favorite-dialog ${isClosingAlert ? "closing" : ""}`} onClick={(e) => e.stopPropagation()}>
            <p>{alertMessage}</p>
          </div>
        </div>
      )}
    </>
  );
}