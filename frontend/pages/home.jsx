import { useNavigate } from "react-router-dom";
import React, { useState, useEffect } from "react";
import "../styles/pages/home.css";


import Header from "../components/header";
import LoginModal from "../components/modals/loginModal";

export default function Home({ handleLogout }) {
  const navigate = useNavigate();
  const [showCookiePopup, setShowCookiePopup] = useState(false);
  const username = localStorage.getItem("username") || "Aventureiro(a)"; // se não tiver login vem como Aventureiro(a)

   useEffect(() => {
    // Verifica se o usuário já aceitou ou recusou os cookies
    const cookieConsent = localStorage.getItem("cookieConsent");
    if (!cookieConsent) {
      setShowCookiePopup(true);
    }
  }, []);

  const handleCookieConsent = (accepted) => {
    if (accepted) {
      localStorage.setItem("cookieConsent", "accepted");
    } else {
      localStorage.setItem("cookieConsent", "declined");
    }
    setShowCookiePopup(false);
  };

  return (
    <>

      {/* HEADER */}
      <Header handleLogout={handleLogout} />

      {/* MAIN */}

      <main className="home-main">
        <span id="welcome-message">
          Olá, {username}!
        </span>
        <h2 id="title-home">Criação de Fichas para sistemas de RPG</h2>

        <p id="description-home">Crie a sua primeira ficha e faça parte da comunidade !!</p>

        <button onClick={() => navigate("/create")} className="btn-create-home">
          Criar nova ficha
        </button>
        <div className="sub2">Escolha o seu sistema favorito!!</div>
        
          <div className="sistemas">
            <button>GURPS</button>
            <button disabled="disabled" title="Work in progress">Dungeon and Dragons</button>
            <button disabled="disabled" title="Work in progress">Shadow Dark</button>
          </div>

        <div className="main-content">
          <div className="main-content-text1">
            <h2>Uma biblioteca extensa e detalhada de cada sistema</h2>
            <p>
              ● Um banco completo, pronto para atender todas as necessidades dos mestres e jogadores<br />
              ● Sistemas com constante atualização, garantindo a melhor experiência<br />
              ● Suporte e auxílio para todos os perfís de jogadores
            </p>
          </div>
          <img src="Modelo_fichas_1.png" alt="Modelo de Fichas" />
        </div>
      </main>

      {showCookiePopup && (
        <div className="cookie-popup-overlay">
          <div className="cookie-popup">
            <div className="cookie-popup-content">
              <div className="cookie-icon">🍪</div>
              <h3>Nós usamos cookies!</h3>
              <p>
                Utilizamos cookies para melhorar sua experiência em nosso site. 
                Ao continuar navegando, você concorda com nossa 
                <a> Política de Privacidade</a>.
              </p>
              <div className="cookie-buttons">
                <button 
                  className="cookie-btn cookie-btn-accept"
                  onClick={() => handleCookieConsent(true)}
                >
                  Aceitar
                </button>
                <button 
                  className="cookie-btn cookie-btn-decline"
                  onClick={() => handleCookieConsent(false)}
                >
                  Recusar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </>
  );
 
}
