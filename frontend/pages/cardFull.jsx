import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";

import { getCardById, favoriteCard, getUserInfo } from "../services/api";
import Header from "../components/header";

import "../styles/pages/cardFull.css";
import Loading from "../components/loading";
import RatingModal from "../components/modals/ratingModal";
import LoginModal from "../components/modals/loginModal";

export default function CardFull({ handleLogout }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [card, setCard] = useState(null);
  const [profile, setProfile] = useState(null);
  const token = localStorage.getItem("token");
  const currentUser = token ? jwtDecode(token) : null;
  const [loading, setLoading] = useState(true);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  useEffect(() => {
    async function loadCard() {
      try {
        setLoading(true);
        const data = await getCardById(id);
        const dataProfile = await getUserInfo(data?.userId);
        setCard(data);
        setProfile(dataProfile);
      } finally {
        setLoading(false);
      }
    }

    loadCard();
  }, [id]);

  const isOwner = currentUser?.id === card?.userId;

  function RatingStars({ rating = 0 }) {
    const rounded = Math.round(rating * 2) / 2;
    const fullStars = Math.floor(rounded);
    const hasHalfStar = rounded % 1 !== 0;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    return (
      <>
        {[...Array(fullStars)].map((_, index) => (
          <img src="/stars/full_star.webp" key={`full-${index}`} />
        ))}
        {hasHalfStar && <img src="/stars/half_star.webp" />}
        {[...Array(emptyStars)].map((_, index) => (
          <img src="/stars/null_star.webp" key={`empty-${index}`} />
        ))}
      </>
    );
  }

  async function addFavorite(userId, cardId) {
    if (userId == null) {
      setShowLoginModal(true);
      return;
    }

    const response = await favoriteCard(userId, cardId);

    // 7° Verifica a resposta
    if (response.error) {
      alert(`${response.error}`);
      return;
    }
    alert("Ficha Favoritada!");
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

  // Separa vantagens e desvantagens
  const advantages =
    card?.traits?.filter((t) => t.trait.isAdvantage === true) || [];
  const disadvantages =
    card?.traits?.filter((t) => t.trait.isAdvantage === false) || [];

  if (loading) {
    return <Loading />;
  }

  return (
    <>
      <Header handleLogout={handleLogout} />
     
        <div className="card-main">
          
          <img
            id="img-profile-card"
            src={profile?.image}
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/profile/${profile?.id}`);
            }}
          ></img>
          <h2 id="name-profile-card">{profile?.name}</h2>
          <h2 className="card-title">{card?.name}</h2>
          <div className="card-actions">
            {isOwner && <button id="edit-btn">Editar Card</button>}
            {!isOwner && (
              <div className="card-actions-noOwner">
                <button id="rate-btn" onClick={() => openRatingModal()}>
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
          {/* VANTAGENS */}
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

          {/* DESVANTAGENS */}
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

          {/* AMPLIAÇÕES */}
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

          {/* LIMITAÇÕES */}
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

          {/* PERÍCIAS */}
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

          {/* TÉCNICAS */}
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

          {/* MÁGIAS */}
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

      {/* Modal para adicionar Vantagens */}
      {showRatingModal && (
        <RatingModal onClose={closeRatingModal} cardId={card.id} />
      )}

      {/* MODAL LOGIN */}
      {showLoginModal && <LoginModal onClose={closeLoginModal} />}
    </>
  );
}
