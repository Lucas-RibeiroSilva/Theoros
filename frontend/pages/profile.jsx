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
  updateUserImage,
  updateUserName,
  updateUserDescription,
  deleteCard,
  deleteUser,
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

  const [userImage, setUserImage] = useState("");
  const [userName, setUserName] = useState("");
  const [userDescription, setUserDescription] = useState("");
  const [deletedCardId, setDeletedCardId] = useState(null);

  const removeProfile = true;

  // ÚNICO ESTADO PARA TODOS OS POPUPS DE CONFIRMAÇÃO
  const [confirmation, setConfirmation] = useState(null);

  const handleLoading = (isLoading) => {
    setLoading(isLoading);
  };

  // ABRIR POPUP DE CONFIRMAÇÃO
  const openConfirmation = (action) => {
    setConfirmation(action);
  };

  // CONFIRMAR AÇÃO
  const handleConfirm = async () => {
    if (!confirmation) return;

    try {
      setLoading(true);

      switch (confirmation.type) {
        // ALTERAR NOME
        case "updateName":
          await updateUserName(
            confirmation.userId,
            confirmation.value
          );

          setUserName(confirmation.value);
          setEditName(false);
          break;

        // ALTERAR DESCRIÇÃO
        case "updateDescription":
          await updateUserDescription(
            confirmation.userId,
            confirmation.value
          );

          setUserDescription(confirmation.value);
          setEditDescription(false);
          break;

        // ALTERAR IMAGEM
        case "updateImage":
          await updateUserImage(
            confirmation.userId,
            confirmation.value
          );

          setUserImage(confirmation.value);
          setUserData((prev) => ({
            ...prev,
            image: confirmation.value,
          }));
          break;

        // EXCLUIR FICHA
        case "deleteCard":
          await deleteCard(confirmation.cardId);

          setDeletedCardId(confirmation.cardId)
          break;

        // EXCLUIR PERFIL
        case "deleteProfile":
          await deleteUser(confirmation.userId);

          setConfirmation(null);
          handleLogout();
          return;

        default:
          console.warn(
            "Tipo de ação desconhecido:",
            confirmation.type
          );
      }

      setConfirmation(null);
    } catch (error) {
      console.error("Erro ao executar ação:", error);
    } finally {
      setLoading(false);
    }
  };

  // CANCELAR AÇÃO
  const handleCancel = () => {
    setEditName(false)
    setUserName(userData?.username)
    setEditDescription(false)
    setUserDescription(userData?.description)
    setConfirmation(null);
  };

  // ABRIR CONFIRMAÇÃO PARA EXCLUIR FICHA
  const openConfirmationDialog = (cardId) => {
    openConfirmation({
      type: "deleteCard",
      cardId,
    });
  };

  // PEGAR ID DO USUÁRIO ATRAVÉS DO TOKEN
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

  // BUSCAR INFORMAÇÕES DO USUÁRIO
  useEffect(() => {
    async function loadInfos() {
      try {
        setLoading(true);

        // ID do usuário logado
        const loggedUserId = getUserIdFromToken();

        if (!loggedUserId) {
          console.error("Usuário não autenticado");
          setLoading(false);
          navigate("/");
          return;
        }

        // Se tiver userId na URL, mostra esse perfil.
        // Caso contrário, mostra o próprio perfil.
        const targetUserId = userId || loggedUserId;

        // Verifica se é o próprio perfil
        setIsOwnProfile(
          String(targetUserId) === String(loggedUserId)
        );

        // Busca usuário logado para verificar admin
        const loggedUser = await getUserInfo(loggedUserId);

        if (loggedUser?.admin) {
          setIsAdmin(true);
        }

        // Busca dados do perfil
        const data = await getUserInfo(targetUserId);

        if (data?.error) {
          console.error(data.error);
          setLoading(false);
          return;
        }

        setUserData(data);
        setUserImage(data?.image || "");
        setUserName(data?.username || "");
        setUserDescription(data?.description || "");

        setLoading(false);
      } catch (error) {
        console.error("Erro:", error);
        setLoading(false);
      }
    }

    loadInfos();
  }, [userId, navigate]);

  // EDITAR IMAGEM
  function editImageProfile() {
    fileInputRef.current?.click();
  }

  // QUANDO UMA NOVA IMAGEM FOR SELECIONADA
  async function imageChange(e) {
    const file = e.target.files?.[0];

    if (!file) {
      return;
    }

    const getBase64 = async (file) => {
      return new Promise((resolve, reject) => {
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

    try {
      const imageBase64 = await getBase64(file);

      // Não atualiza imediatamente.
      // Primeiro abre o popup de confirmação.
      openConfirmation({
        type: "updateImage",
        userId: userData.id,
        value: imageBase64,
      });
    } catch (error) {
      console.error("Erro ao carregar imagem:", error);
    }

    // Permite selecionar a mesma imagem novamente depois
    e.target.value = "";
  };

  // LOADING INICIAL
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
      <Header
        handleLogout={handleLogout}
        removeProfile={removeProfile}
      />

      {loading && <Loading />}

      <div className="profile-container">
        {/* LADO ESQUERDO */}
        <div className="profile-left">
          <div className="person-profile">
            {/* INPUT DE IMAGEM */}
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              style={{ display: "none" }}
              onChange={imageChange}
            />

            {/* IMAGEM DO PERFIL */}
            {userData.image ? (
              <div className="div-image-profile">
                <img
                  className="image-profile"
                  src={userImage}
                  alt="Imagem de Perfil"
                />

                {(isOwnProfile || isAdmin) && (
                  <Tooltip
                    title="Editar foto de perfil"
                    arrow
                  >
                    <FiEdit2
                      id="edit-image-profile"
                      onClick={editImageProfile}
                    />
                  </Tooltip>
                )}
              </div>
            ) : (
              <div className="div-image-profile">
                <AccountCircleOutlinedIcon
                  className="image-profile-default-avatar"
                />

                {(isOwnProfile || isAdmin) && (
                  <Tooltip
                    title="Editar foto de perfil"
                    arrow
                  >
                    <FiEdit2
                      id="edit-image-profile"
                      onClick={editImageProfile}
                    />
                  </Tooltip>
                )}
              </div>
            )}

            {/* NOME */}
            {editName ? (
              <input
                id="input-name-profile"
                type="text"
                value={userName}
                onChange={(e) =>
                  setUserName(e.target.value)
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();

                    openConfirmation({
                      type: "updateName",
                      userId: userData.id,
                      value: userName,
                    });
                  }

                  if (e.key === "Escape") {
                    setEditName(false);
                    setUserName(userData.username || "");
                  }
                }}
                autoFocus
              />
            ) : (
              <div className="div-name-profile">
                <h1 id="name-profile">{userName}</h1>

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

            {/*  DESCRIÇÃO */}
            {editDescription ? (
              <textarea
                id="textarea-description-profile"
                value={userDescription}
                maxLength={252}
                onChange={(e) =>
                  setUserDescription(e.target.value)
                }
                onKeyDown={(e) => {
                  // Enter confirma
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();

                    openConfirmation({
                      type: "updateDescription",
                      userId: userData.id,
                      value: userDescription,
                    });
                  }
                  if (
                    e.key === "Escape"
                  ) {
                    setEditDescription(false);
                    setUserDescription(
                      userData.description || ""
                    );
                  }
                }}
                autoFocus
              />
            ) : (
              <div className="div-description-profile">
                <h3 className="description-profile">
                  {userDescription || "Sem descrição"}
                </h3>

                {(isOwnProfile || isAdmin) && (
                  <Tooltip
                    title="Editar descrição"
                    arrow
                  >
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

            {/*EXCLUIR PERFIL*/}
            {(isOwnProfile || isAdmin) && (
              <button
                id="delete-profile-btn"
                onClick={() => {
                  openConfirmation({
                    type: "deleteProfile",
                    userId: userData.id,
                  });
                }}
              >
                Apagar Perfil
              </button>
            )}
          </div>
        </div>

        {/*LADO DIREITO*/}
        <div className="profile-right">
          <div className="section-profile-buttons">
            <button
              className={
                activeSection === "cards-created"
                  ? "active"
                  : ""
              }
              onClick={() =>
                setActiveSection("cards-created")
              }
            >
              Criadas
            </button>

            <button
              className={
                activeSection === "cards-favorites"
                  ? "active"
                  : ""
              }
              onClick={() =>
                setActiveSection("cards-favorites")
              }
            >
              Favoritas
            </button>
          </div>

          <div className="sections-profile">
            {activeSection === "cards-created" && (
              <CreatedSection
                onLoading={handleLoading}
                openConfirmDialog={openConfirmationDialog}
                deletedCardId={deletedCardId}
              />
            )}

            {activeSection === "cards-favorites" && (
              <FavoritesSection
                onLoading={handleLoading}
              />
            )}
          </div>
        </div>
      </div>

      {/* POPUP DE CONFIRMAÇÃO */}
      {confirmation && (
        <div className="modal-overlay-confirmation">
          <div className="confirmation-dialog">
            {confirmation.type === "updateName" && (
              <h2>
                Tem certeza que deseja alterar seu nome?
              </h2>
            )}

            {confirmation.type ===
              "updateDescription" && (
              <h2>
                Tem certeza que deseja alterar sua
                descrição?
              </h2>
            )}

            {confirmation.type === "updateImage" && (
              <h2>
                Tem certeza que deseja alterar sua foto
                de perfil?
              </h2>
            )}

            {confirmation.type === "deleteCard" && (
              <h2>
                Tem certeza que deseja excluir esta
                ficha?
              </h2>
            )}

            {confirmation.type === "deleteProfile" && (
              <h2>
                Tem certeza que deseja excluir seu
                perfil?
              </h2>
            )}

            {/* DESCRIÇÃO */}
            {confirmation.type === "deleteCard" ||
            confirmation.type === "deleteProfile" ? (
              <p>Essa ação é irreversível!</p>
            ) : (
              <p>
                Está ação é Irreversível!!
              </p>
            )}

            {/* BOTÕES */}
            <div className="confirmation-buttons">
              <button onClick={handleConfirm}>
                Sim
              </button>

              <button onClick={handleCancel}>
                Não
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
