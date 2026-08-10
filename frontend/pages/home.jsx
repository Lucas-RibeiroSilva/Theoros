import { useNavigate } from "react-router-dom";

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

        <div className="main-content">
        <h2>
          Uma biblioteca extensa e detalhada de cada sistema
        </h2>
        <h2>
          ● Um banco completo, pronto para atender todas as necessidades dos mestres e jogadores. <br />
          ● Sistemas com constante atualização, garantindo a melhor experiência <br />
          ● Suporte e auxílio para todos os perfís de jogadores
          </h2>
        </div>
      </main>

    </>
  );
 
}
