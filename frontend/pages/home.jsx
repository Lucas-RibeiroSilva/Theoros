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
        <span>
          Olá, {username}!
        </span>
        <h2>Criação de Fichas para sistemas de RPG</h2>

        <p>Crie a sua primeira ficha e faça parte da comunidade !!</p>

        <button onClick={() => navigate("/create")} className="btn-create-home">
          Criar nova ficha
        </button>

        <div className="main-content">
        <h1>
          Uma biblioteca extensa e detalhada de cada sistema
        </h1>
        <h1>
          ● Um banco completo, pronto para atender todas as necessidades dos mestres e jogadores.
          ● Sistemas com constante atualização, garantindo a melhor experiência
          ● Suporte e auxílio para todos os perfís de jogadores
          </h1>
        </div>
      </main>

    </>
  );
 
}
