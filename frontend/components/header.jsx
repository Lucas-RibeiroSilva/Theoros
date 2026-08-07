import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import imgMenu from "/imgMenu.webp";

import "../styles/components/header.css";
import LoginModal from "../components/modals/loginModal";

import AccountCircleOutlinedIcon from "@mui/icons-material/AccountCircleOutlined";
import DoorBackOutlinedIcon from "@mui/icons-material/DoorBackOutlined";
import MeetingRoomOutlinedIcon from "@mui/icons-material/MeetingRoomOutlined";
import D20Dice from './D20Dice';

import {
  getMyUserInfo,
  getUserInfo
} from "../services/api";
// import StyleIcon from '@mui/icons-material/Style'; ICONE DE FICHAS

import Tooltip from "@mui/material/Tooltip";

export default function Header({ handleLogout, removeProfile }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [doorHover, setDoorHover] = useState(false);
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  const [showLoginMenu, setShowLoginMenu] = useState(false);

  const { userId } = useParams();
  const [userData, setUserData] = useState(null);

  const [hover, setHover] = useState(false);

  const [haveProfile, setHaveProfile] = useState(false);
  const [isClosingAlert, setIsClosingAlert] = useState(false);
  const timeoutRef = useRef(null); // Guarda o ID do setTimeout

  const openLoginModal = () => {
    setShowLoginModal(true);
  };

  const closeLoginModal = () => {
    setShowLoginModal(false);
  };

  const navigate = useNavigate();

  // Verifica se é visitante
  const isGuest = !localStorage.getItem("token") && localStorage.getItem("guest_token");

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
  
    // ──────────────────────────────────────────────
    // Buscar informações do usuário
    // ──────────────────────────────────────────────
    useEffect(() => {
      async function loadInfos() {
        try {
          setLoading(true);
  
          // Pega o ID do usuário logado
          const loggedUserId = getUserIdFromToken();
  
          if (!loggedUserId) {
            console.error("Usuário não autenticado");
            setLoading(false);
            navigate("/");
            return;
          }
  
          // Serve para saber qual id usar (loggedUserId = ID do próprio usuário | userId = ID do usuário que deseja ver o perfil)
          const targetUserId = userId || loggedUserId;
  
          // Verifica se é o próprio perfil
          setIsOwnProfile(targetUserId === loggedUserId);
  
          // Verifica se o usuário é adminstrador através do próprio perfil logado
          const loggedUser = await getUserInfo(loggedUserId);
  
          if (loggedUser?.admin) {
            setIsAdmin(true);
          }
  
          // Busca os dados do usuário ou perfil alvo
          const data = await getUserInfo(targetUserId);
  
          if (data?.error) {
            console.error(data.error);
            setLoading(false);
            return;
          }
  
          setUserData(data);
          setLoading(false);
        } catch (error) {
          console.error("Erro:", error);
          setLoading(false);
        }
      }
  
      loadInfos();
    }, [userId]); // Recarrega quando o userId mudar

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, []);

  // Função para exibir o alerta com fechamento automático
  const showAlertWithTimeout = (duration = 3000) => {
    // Cancela qualquer timeout pendente
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    setIsClosingAlert(false);
    setHaveProfile(true);

    // Agenda o fechamento após 'duration' milissegundos
    timeoutRef.current = setTimeout(() => {
      setIsClosingAlert(true);

      setTimeout(() => {
        setHaveProfile(false);
        setIsClosingAlert(false);
      }, 300);

      timeoutRef.current = null;
    }, duration);
  };

  // Fecha o alerta manualmente (cancelando o timeout)
  const closeAlert = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setIsClosingAlert(true);

    setTimeout(() => {
      setHaveProfile(false);
      setIsClosingAlert(false);
    }, 300);
  };

  // Clique no perfil
  function handleProfileClick() {
    // Visitante → abre modal login
    if (isGuest) {
      openLoginModal()
      showAlertWithTimeout()

      return;
    }
    // Usuário logado
    navigate("/profile");
  }

  // UTILIZADO PARA O MENU
  function chamarMenu() {
    setMenuOpen(!menuOpen);
  }

  function fecharMenu() {
    setMenuOpen(false);
  }

  return (
    <>
      <header className="header">

        {/* PERFIL */}
        <div className="header-left">
          {!removeProfile && (
            <button onClick={(e) => { e.preventDefault(); handleProfileClick(); }} className="profile-icon" onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
              {isGuest ? (
              <Tooltip title="Perfil" arrow>
                <AccountCircleOutlinedIcon className="default-profile-icon" />
              </Tooltip>
              ) : (
                <Tooltip title="Perfil" arrow>
                <img src={userData?.image} alt="Logo" className="profile-image" />
                </Tooltip>
              )}
            </button>
          )}

          <div className={`profile-menu ${hover ? "hover" : ""}`} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
            
            <a onClick={() => handleLogout()} className="btn-logout-icon" onMouseEnter={() => setDoorHover(true)} onMouseLeave={() => setDoorHover(false)}>
              {doorHover ? (
                <Tooltip title="Deslogar" arrow>
                  <MeetingRoomOutlinedIcon className="logout-door-icon" />
                </Tooltip>
              ) : (
                <Tooltip title="Deslogar" arrow>
                  <DoorBackOutlinedIcon className="logout-door-icon" />
                </Tooltip>
              )}
            </a>
            
          </div>
        </div>

        <iframe src="/player/player.html" title="Theoros Player" className="header-player-iframe" />

        <D20Dice />

        <div className='header-right'>

          {/* MENU */}
          <button type="button" onClick={chamarMenu} className="btn-menu" aria-expanded={menuOpen}>
            <img src={imgMenu} alt="Menu" className="menu-icon" />

            <span className="hamburger" aria-hidden="true">
              ☰
            </span>
          </button>


          <div className={`menu-container ${menuOpen ? "menuOpen" : ""}`}>

            <div className="opcoes-menu">
              <a onClick={(e) => { e.preventDefault(); navigate("/"); }}>Home</a>
              <a onClick={(e) => { e.preventDefault(); navigate("/create"); }}>Criar</a>
              <a onClick={(e) => { e.preventDefault(); navigate("/searchCards"); }}>Fichas</a>
              <a onClick={(e) => { e.preventDefault(); handleProfileClick(); }}>Perfil</a>
            </div>
          </div>
        </div>
      </header>

      {/* MODAL LOGIN */}
      {showLoginModal && <LoginModal onClose={closeLoginModal} />}

      {haveProfile && (
        <div className={`popup-alert-profile-overlay  ${isClosingAlert ? "closing" : ""}`} onClick={closeAlert} >
          <div className={`alert-profile-dialog ${isClosingAlert ? "closing" : ""}`} onClick={(e) => e.stopPropagation()}>
            <p>Voce precisa Logar ou Registar para acessar a aba de Perfil !</p>
          </div>
        </div>
      )}
    </>
  );
}
