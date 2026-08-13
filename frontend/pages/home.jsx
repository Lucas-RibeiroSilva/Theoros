import { useNavigate } from "react-router-dom";
import React from "react";
import "../styles/pages/home.css";


import Header from "../components/header";
import LoginModal from "../components/modals/loginModal";

export default function Home({ handleLogout }) {
  const navigate = useNavigate();
  //Nome usuário
  const username = localStorage.getItem("username") || "Aventureiro(a)"; // se não tiver login vem como Aventureiro(a)

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

    </>
  );
 
}
