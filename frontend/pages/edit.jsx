import { useState, useEffect } from "react";
import { useParams, useNavigate, Await } from "react-router-dom";

import "../styles/pages/create.css";

import Header from "../components/header";
import LoginModal from "../components/modals/loginModal";
import Loading from "../components/loading";
import BasicSection from "../components/cards/basic/basic";
import CharacteristicsSection from "../components/cards/characteristics/characteristics";
import ModifiersSection from "../components/cards/modifiers/modifiers";
import SpecializationsSection from "../components/cards/specializations/specializations";
import MagicSection from "../components/cards/magic/magic";
import PointsPainel from "../components/popups/pointsPainel";
import SaveCard from "../components/saveCard";

import { getCardById } from "../services/api";
import { useCardStore } from "../stores/cardStore";

export default function EditCard({ handleLogout }) {
  const { cardId } = useParams();
  const navigate = useNavigate();
  const loadCard = useCardStore((state) => state.loadCard);

  useEffect(() => {
    async function loadCardInfo() {
      try {
        setLoading(true);

        const userId = getUserIdFromToken();
        const data = await getCardById(cardId);

        if (!userId) {
          navigate("/");
          return;
        }

        if (userId !== data.userId) {
          navigate("/");
          return;
        }

        if (data?.error) {
          return;
        }

        loadCard(data);

        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    }

    loadCardInfo();
  }, [cardId]);

  // Modal login
  const [showLoginModal, setShowLoginModal] = useState(false);

  const closeLoginModal = () => {
    setShowLoginModal(false);
  };

  const openLoginModal = () => {
    setShowLoginModal(true);
  };

  // Seções
  const [activeSection, setActiveSection] = useState("basic");

  // Tela de carragamento
  const [loading, setLoading] = useState(false);

  const handleLoading = (isLoading) => {
    setLoading(isLoading);
  };

  function getUserIdFromToken() {
    const token = localStorage.getItem("token");

    if (!token) {
      return null;
    }

    try {
      const parts = token.split(".");
      if (parts.length !== 3) {
        return null;
      }

      const payload = JSON.parse(atob(parts[1]));
      return payload.id;
    } catch (error) {
      console.error("Erro ao decodificar token:", error);
      return null;
    }
  }

  return (
    <>
      {/* LOGIN MODAL */}
      {showLoginModal && <LoginModal onClose={closeLoginModal} />}

      {/* HEADER */}
      <Header handleLogout={handleLogout} />

      {/* Tela de carregamento */}
      {loading && <Loading />}

      {/* NAVEGAÇÃO */}
      <div className="section-create-buttons">
        <button
          className={activeSection === "basic" ? "active" : ""}
          onClick={() => setActiveSection("basic")}
          id="button-create"
        >
          Básico
        </button>

        <button
          className={activeSection === "characteristics" ? "active" : ""}
          onClick={() => setActiveSection("characteristics")}
          id="button-create"
        >
          Características
        </button>

        <button
          className={activeSection === "modifiers" ? "active" : ""}
          onClick={() => setActiveSection("modifiers")}
          id="button-create"
        >
          Modificadores
        </button>

        <button
          className={activeSection === "specializations" ? "active" : ""}
          onClick={() => setActiveSection("specializations")}
          id="button-create"
        >
          Especializações
        </button>

        <button
          className={activeSection === "magic" ? "active" : ""}
          onClick={() => setActiveSection("magic")}
          id="button-create"
        >
          Mágia
        </button>
        <SaveCard id="save-popup" onOpenLoginModal={openLoginModal} cardId={cardId} isEdit={true}/>
      </div>

      {/* SEÇÕES */}

      <div className="sections-create">
        {activeSection === "basic" && (
          <BasicSection onLoading={handleLoading} />
        )}

        {activeSection === "characteristics" && (
          <CharacteristicsSection onLoading={handleLoading} />
        )}

        {activeSection === "modifiers" && (
          <ModifiersSection onLoading={handleLoading} />
        )}

        {activeSection === "specializations" && (
          <SpecializationsSection onLoading={handleLoading} />
        )}

        {activeSection === "expansions" && (
          <ExpansionsSection onLoading={handleLoading} />
        )}

        {activeSection === "magic" && (
          <MagicSection onLoading={handleLoading} />
        )}
      </div>

      <PointsPainel id="points-popup" />
    </>
  );
}