import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import imgMenu from "/imgMenu.webp";

import "../styles/components/header.css";
import LoginModal from "../components/modals/loginModal";

import AccountCircleOutlinedIcon from "@mui/icons-material/AccountCircleOutlined";
import DoorBackOutlinedIcon from "@mui/icons-material/DoorBackOutlined";
import MeetingRoomOutlinedIcon from "@mui/icons-material/MeetingRoomOutlined";
import D20Dice from './D20Dice';
// import StyleIcon from '@mui/icons-material/Style'; ICONE DE FICHAS

import Tooltip from "@mui/material/Tooltip";

export default function Header({ handleLogout, removeProfile }) {
  const [menuOpen, setMenuOpen] = useState(false);

  const [doorHover, setDoorHover] = useState(false);

  const [showLoginModal, setShowLoginModal] = useState(false);

  const [showLoginMenu, setShowLoginMenu] = useState(false);

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
              <Tooltip title="Perfil" arrow>
                <AccountCircleOutlinedIcon className="default-profile-icon" />
              </Tooltip>
            </button>
          )}

          <div className={`login-menu ${hover ? "hover" : ""}`} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
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

        <D20Dice />

        <div className='header-right'>

          {/* MENU */}
          <button type="button" onClick={chamarMenu} className="btn-menu" aria-expanded={menuOpen}>
            <img src={imgMenu} alt="Menu" className="menu-icon" />
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
