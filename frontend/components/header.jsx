import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import AccountCircleOutlinedIcon from "@mui/icons-material/AccountCircleOutlined";
import DoorBackOutlinedIcon from "@mui/icons-material/DoorBackOutlined";
import MeetingRoomOutlinedIcon from "@mui/icons-material/MeetingRoomOutlined";
import Tooltip from "@mui/material/Tooltip";

import imgMenu from "/menuScroll.png";

import "../styles/components/header.css";
import LoginModal from "../components/modals/loginModal";
import D20Dice from "./D20Dice";

import { getUserInfo } from "../services/api";

export default function Header({
  handleLogout,
  removeProfile,
  onLoginSuccess,
}) {
  const navigate = useNavigate();
  const timeoutRef = useRef(null);

  // -----------------------------
  // Estados
  // -----------------------------
  const [menuOpen, setMenuOpen] = useState(false);
  const [doorHover, setDoorHover] = useState(false);
  const [profileHover, setProfileHover] = useState(false);

  const [showLoginModal, setShowLoginModal] = useState(false);

  const [userData, setUserData] = useState(null);
  const [isGuest, setIsGuest] = useState(!localStorage.getItem("token"));

  const [showProfileAlert, setShowProfileAlert] = useState(false);
  const [closingProfileAlert, setClosingProfileAlert] = useState(false);

  const [showLogoutAlert, setShowLogoutAlert] = useState(false);
  const [closingLogoutAlert, setClosingLogoutAlert] = useState(false);

  // -----------------------------
  // Limpa timeout ao desmontar
  // -----------------------------
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // -----------------------------
  // Recupera ID do usuário
  // -----------------------------
  const getUserIdFromToken = () => {
    const token = localStorage.getItem("token");

    if (!token) {
      return null;
    }

    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      return payload.id ?? null;
    } catch (error) {
      console.error("Erro ao decodificar token:", error);
      return null;
    }
  };

  // -----------------------------
  // Busca informações do usuário
  // -----------------------------
  const updateInfoUser = async () => {
    try {
      const userId = getUserIdFromToken();

      if (!userId) {
        setIsGuest(true);
        setUserData(null);
        return;
      }

      setIsGuest(false);

      const data = await getUserInfo(userId);

      if (data?.error) {
        console.error(data.error);
        return;
      }

      setUserData(data);
    } catch (error) {
      console.error("Erro ao atualizar usuário:", error);
    }
  };

  // Busca usuário ao carregar o Header
  useEffect(() => {
    updateInfoUser();
  }, []);

  // -----------------------------
  // Login
  // -----------------------------
  const openLoginModal = () => {
    setShowLoginModal(true);
  };

  const closeLoginModal = () => {
    setShowLoginModal(false);
  };

  // -----------------------------
  // Alertas
  // -----------------------------
  const showAlert = (setShow, setClosing, duration = 2000) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    setClosing(false);
    setShow(true);

    timeoutRef.current = setTimeout(() => {
      setClosing(true);

      setTimeout(() => {
        setShow(false);
        setClosing(false);
      }, 300);

      timeoutRef.current = null;
    }, duration);
  };

  const closeAlert = (setShow, setClosing) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    setClosing(true);

    setTimeout(() => {
      setShow(false);
      setClosing(false);
    }, 300);
  };

  const showProfileLoginAlert = () => {
    showAlert(setShowProfileAlert, setClosingProfileAlert);
  };

  const showLogoutSuccessAlert = () => {
    showAlert(setShowLogoutAlert, setClosingLogoutAlert);
  };

  // -----------------------------
  // Perfil
  // -----------------------------
  const handleProfileClick = () => {
    if (isGuest) {
      openLoginModal();
      showProfileLoginAlert();
      return;
    }

    navigate("/profile");
  };

  // -----------------------------
  // Logout
  // -----------------------------
  const logoutProfile = () => {
    handleLogout();
    showLogoutSuccessAlert();
  };

  // -----------------------------
  // Menu
  // -----------------------------
  const toggleMenu = () => {
    setMenuOpen((prev) => !prev);
  };

  const closeMenu = () => {
    setMenuOpen(false);
  };

  const handleNavigation = (path) => {
    navigate(path);
    closeMenu();
  };

  // -----------------------------
  // Render
  // -----------------------------
  const hasProfileImage = !isGuest && userData?.image;

  return (
    <>
      <header className="home-header">
        {/* PERFIL */}
        <div className="header-left">
          {!removeProfile && (
            <button
              type="button"
              className="profile-icon"
              onClick={handleProfileClick}
              onMouseEnter={() => setProfileHover(true)}
              onMouseLeave={() => setProfileHover(false)}
            >
              <Tooltip title="Perfil" arrow>
                {hasProfileImage ? (
                  <img
                    src={userData.image}
                    alt="Perfil"
                    className="profile-image"
                  />
                ) : (
                  <AccountCircleOutlinedIcon className="default-profile-icon" />
                )}
              </Tooltip>
            </button>
          )}

          <div
            className={`profile-menu ${profileHover ? "hover" : ""}`}
            onMouseEnter={() => setProfileHover(true)}
            onMouseLeave={() => setProfileHover(false)}
          >
            <button
              type="button"
              className="btn-logout-icon"
              onClick={logoutProfile}
              onMouseEnter={() => setDoorHover(true)}
              onMouseLeave={() => setDoorHover(false)}
            >
              <Tooltip title="Deslogar" arrow>
                {doorHover ? (
                  <MeetingRoomOutlinedIcon className="logout-door-icon" />
                ) : (
                  <DoorBackOutlinedIcon className="logout-door-icon" />
                )}
              </Tooltip>
            </button>
          </div>
        </div>

        {/* D20 */}
        <D20Dice />

        {/* MENU */}
        <div className="header-right">
          <button
            type="button"
            className="btn-menu"
            onClick={toggleMenu}
            aria-expanded={menuOpen}
            aria-label="Abrir menu"
          >
            <img src={imgMenu} alt="Menu" className="menu-icon" />

            <span className="hamburger" aria-hidden="true">
              ☰
            </span>
          </button>

          <div className={`menu-container ${menuOpen ? "menuOpen" : ""}`}>
            <nav className="opcoes-menu">
              <a onClick={() => handleNavigation("/")}>Home</a>

              <a onClick={() => handleNavigation("/create")}>Criar</a>

              <a onClick={() => handleNavigation("/searchCards")}>Fichas</a>

              <a onClick={handleProfileClick}>Perfil</a>
            </nav>
          </div>
        </div>
      </header>

      {/* MODAL DE LOGIN */}
      {showLoginModal && (
        <LoginModal
          onClose={closeLoginModal}
          onLoginSuccess={onLoginSuccess ?? updateInfoUser}
        />
      )}

      {/* ALERTA DE LOGIN */}
      {showProfileAlert && (
        <div
          className={`popup-alert-profile-overlay ${
            closingProfileAlert ? "closing" : ""
          }`}
          onClick={() =>
            closeAlert(setShowProfileAlert, setClosingProfileAlert)
          }
        >
          <div
            className={`alert-profile-dialog ${
              closingProfileAlert ? "closing" : ""
            }`}
            onClick={(event) => event.stopPropagation()}
          >
            <p>Você precisa logar ou registrar para acessar a aba de Perfil!</p>
          </div>
        </div>
      )}

      {/* ALERTA DE LOGOUT */}
      {showLogoutAlert && (
        <div
          className={`popup-logout-overlay ${
            closingLogoutAlert ? "closing" : ""
          }`}
          onClick={() => closeAlert(setShowLogoutAlert, setClosingLogoutAlert)}
        >
          <div
            className={`popup-logout-dialog ${
              closingLogoutAlert ? "closing" : ""
            }`}
            onClick={(event) => event.stopPropagation()}
          >
            <p>Deslogado com sucesso!</p>
          </div>
        </div>
      )}
    </>
  );
}
