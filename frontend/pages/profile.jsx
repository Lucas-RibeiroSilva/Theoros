import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "../components/header";
import "../styles/pages/profile.css";
import FavoritesSection from "../components/cards/profile/favoritesCards";
import CreatedSection from "../components/cards/profile/createdCards";
import Loading from "../components/loading";
import AccountCircleOutlinedIcon from "@mui/icons-material/AccountCircleOutlined";
import { FiEdit2 } from "react-icons/fi";

import {
  getUserInfo,
  getMyUserInfo,
  updateUserImage,
  updateUserName,
  updateUserDescription,
  deleteCard,
  deleteUser
} from "../services/api";

import Tooltip from "@mui/material/Tooltip";

export default function Profile({ handleLogout }) {
  const navigate = useNavigate();
  const { userId } = useParams();
  const fileInputRef = useRef(null);
  const [editName, setEditName] = useState(false);
  const [editDescription, setEditDescription] = useState(false);
  const [activeSection, setActiveSection] = useState("cards-created");
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState(null);
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userName, setUserName] = useState("");
  const [userDescription, setUserDescription] = useState("");
  const removeProfile = true;
  const [showConfirmDeleteCard, setShowConfirmDeleteCard] = useState(false);
  const [showConfirmDeleteProfile, setShowConfirmDeleteProfile] = useState(false);
  const [cardToDelete, setCardToDelete] = useState(null);

  const handleLoading = (isLoading) => {
    setLoading(isLoading);
  };

  const openConfirmationDialog = async (cardId) => {
    setCardToDelete(cardId);
    setShowConfirmDeleteCard(true);
  };

  const handleConfirm = async () => {
    if (cardToDelete) {
      await deleteCard(cardToDelete);
      setShowConfirmDeleteCard(false);
      setCardToDelete(null);
      window.location.reload();
    }
  };

  const handleConfirmProfile = async () => {
      await deleteUser(userData.id);
      setShowConfirmDeleteProfile(false);
      handleLogout();
  };

  const handleCancel = () => {
    setShowConfirmDeleteCard(false);
    setCardToDelete(null);
  };

  const handleCancelProfile = () => {
    setShowConfirmDeleteProfile(false);
  };

  // ──────────────────────────────────────────────
  // Pegar o ID do usuário através do token
  // ──────────────────────────────────────────────
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

  // ──────────────────────────────────────────────
  // Funções para editar/apagar (só no próprio perfil)
  // ──────────────────────────────────────────────
  function editImageProfile() {
    fileInputRef.current.click();
  }

  async function imageChange(e) {
  const file = e.target.files[0];

  const getBase64 = async (file) => {
    return new Promise((resolve, reject) => {
      if (!file) {
        reject(new Error("Nenhuma imagem selecionada"));
        return;
      }

      if (!(file instanceof File) && !(file instanceof Blob)) {
        reject(new Error("Arquivo inválido"));
        return;
      }

      const reader = new FileReader();

      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);

      reader.readAsDataURL(file);
    });
  };

  const imageBase64 = await getBase64(file);

  await updateUserImage(userData.id, imageBase64);
  window.location.reload();
}

  if (!userData) {
  return (
    <>
      <Header handleLogout={handleLogout} />
      <Loading />
    </>
  );
  }

  return (
    <>
      <Header handleLogout={handleLogout} removeProfile={removeProfile} />

      {loading && <Loading />}

      <div className="profile-container">
        <div className="profile-left">
          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            style={{ display: "none" }} // Serve para ficar trasnparente
            onChange={imageChange}
          />

          {userData.image ? (
            <div className="div-image-profile">
              <img
                className="image-profile"
                src={userData.image}
                alt="Imagem de Perfil"
              />
              {(isOwnProfile || isAdmin) && (
                <Tooltip title="Editar foto de perfil" arrow>
                  <FiEdit2 id="edit-image-profile" onClick={editImageProfile} />
                </Tooltip>
              )}
            </div>
          ) : (
            <div className="div-image-profile">
              <AccountCircleOutlinedIcon className="image-profile-default-avatar" />

              {isOwnProfile && (
                <Tooltip title="Editar foto de perfil" arrow>
                  <FiEdit2 id="edit-image-profile" onClick={editImageProfile} />
                </Tooltip>
              )}
            </div>
          )}
          {editName ? (
            <input
              id="input-name-profile"
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              onKeyDown={async (e) => {
  if (e.key === "Enter") {
    await updateUserName(userData.id, userName);
    setEditName(false);
    window.location.reload();
  }
}}
              autoFocus
            />
          ) : (
            <div className="div-name-profile">
              <h1 id="name-profile">{userData.username}</h1>
              {(isOwnProfile || isAdmin) && (
                <Tooltip title="Editar nome" arrow>
                  <FiEdit2
                    id="edit-name-profile"
                    onClick={() => {
                      setEditName(true);
                    }}
                  />
                </Tooltip>
              )}
            </div>
          )}

          {editDescription ? (
            <textarea
              id="textarea-description-profile"
              value={userDescription}
              maxLength={252}
              onChange={(e) => setUserDescription(e.target.value)}
              onKeyDown={async (e) => {
  if (e.key === "Enter") {
    await updateUserDescription(userData.id, userDescription);
    setEditDescription(false);
    window.location.reload();
  }
}}
              autoFocus
            />
          ) : (
            <div className="div-description-profile">
              <h3 className="description-profile">
                {userData.description || "Sem descrição"}
              </h3>
              {(isOwnProfile || isAdmin) && (
                <Tooltip title="Editar descrição" arrow>
                  <FiEdit2
                    id="edit-description-profile"
                    onClick={() => {
                      setEditDescription(true);
                    }}
                  />
                </Tooltip>
              )}
            </div>
          )}

          {(isOwnProfile || isAdmin) && (
            <button id="delete-profile-btn" onClick={() => setShowConfirmDeleteProfile(true)}>
              Apagar Perfil
            </button>
          )}
        </div>

        <div className="profile-right">
          <div className="section-profile-buttons">
            <button
              className={activeSection === "cards-created" ? "active" : ""}
              onClick={() => setActiveSection("cards-created")}
            >
              Criadas
            </button>

            <button
              className={activeSection === "cards-favorites" ? "active" : ""}
              onClick={() => setActiveSection("cards-favorites")}
            >
              Favoritas
            </button>
          </div>

          <div className="sections-profile">
            {activeSection === "cards-created" && (
              <CreatedSection
                onLoading={handleLoading}
                openConfirmDialog={openConfirmationDialog}
              />
            )}

            {activeSection === "cards-favorites" && (
              <FavoritesSection onLoading={handleLoading} />
            )}
          </div>
        </div>
      </div>

      {showConfirmDeleteCard && (
        <div className="modal-overlay-confirmation">
          <div className="confirmation-dialog">
            <h2>Tem certeza que deseja excluir está ficha?</h2>
            <p>Essa ação é irreversível!!</p>
            <div className="confirmation-buttons">
              <button onClick={handleConfirm}>Sim</button>
              <button onClick={handleCancel}>Não</button>
            </div>
          </div>
        </div>
      )}

      {showConfirmDeleteProfile && (
        <div className="modal-overlay-confirmation">
          <div className="confirmation-dialog">
            <h2>Tem certeza que deseja excluir seu perfil?</h2>
            <p>Essa ação é irreversível!!</p>
            <div className="confirmation-buttons">
              <button onClick={handleConfirmProfile}>Sim</button>
              <button onClick={handleCancelProfile}>Não</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
