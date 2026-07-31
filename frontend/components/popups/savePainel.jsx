import { useState, useEffect, useRef } from "react";
import "../../styles/popups/savePainel.css";
import { useCardStore } from "../stores/cardStore";
import { createCard } from "../../services/api";
import { FaDownload } from "react-icons/fa";

export default function SavePainel({ onOpenLoginModal }) {
  const [showAlert, setShowAlert] = useState(false);
  const [isClosingAlert, setIsClosingAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const timeoutRef = useRef(null); // Guarda o ID do setTimeout
  const state = useCardStore();

  // Limpa o timeout ao desmontar o componente
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, []);

  // Função para exibir o alerta com fechamento automático
  const showAlertWithTimeout = (message, duration = 3000) => {
    // Cancela qualquer timeout pendente
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    setAlertMessage(message);
    setIsClosingAlert(false);
    setShowAlert(true);

    // Agenda o fechamento após 'duration' milissegundos
    timeoutRef.current = setTimeout(() => {
      setIsClosingAlert(true);

      setTimeout(() => {
        setShowAlert(false);
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
      setShowAlert(false);
      setIsClosingAlert(false);
    }, 300);
  };

  const saveCard = async () => {
    try {
      // 1° Verifica se o usuário está logado através do token
      const token = localStorage.getItem("token");

      // Se o usuário não estiver logado, abre o modal de Login
      if (!token) {
        if (onOpenLoginModal) {
          onOpenLoginModal();
        }
        return;
      }

      // 2° Verifica se tem nome
      if (!state.name) {
        showAlertWithTimeout("O nome da ficha é obrigatório !!");
        return;
      }

      // 3° Transforma a imagem em base64
      const getBase64 = (file) => {
        return new Promise((resolve, reject) => {
          if (!file) {
            reject(new Error('Nenhum arquivo fornecido'));
            return;
          }

          if (!(file instanceof File) && !(file instanceof Blob)) {
            reject(new Error('Arquivo inválido'));
            return;
          }

          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = (error) => reject(error);
          reader.readAsDataURL(file);
        });
      };

      // 4° Monta o payload
      let imageBase64 = null;

      if (state.imageBase64) {
        imageBase64 = state.imageBase64;
      } else if (state.imageFile instanceof File) {
        try {
          imageBase64 = await getBase64(state.imageFile);
        } catch (error) {
          console.warn('Erro ao converter imagem:', error);
        }
      }

      // 5° Monta o cardData
      const cardData = {
        name: state.name,
        image: imageBase64,
        gender: state.gender || '',
        height: state.height ? parseFloat(state.height) : null,
        age: state.age ? parseInt(state.age) : null,
        raceId: state.raceId,
        strength: state.attributes?.strength?.current ?? 0,
        life: state.attributes?.life?.current ?? 0,
        dexterity: state.attributes?.dexterity?.current ?? 0,
        health: state.attributes?.health?.current ?? 0,
        fatigue: state.attributes?.fatigue?.current ?? 0,
        intelligence: state.attributes?.intelligence?.current ?? 0,
        perception: state.attributes?.perception?.current ?? 0,
        willing: state.attributes?.willing?.current ?? 0,
        history: state.history || '',
        alignment: state.alignment || '',

        advantages: state.advantages?.map((a) => ({
          id: a.id,
          level: a.level || 0,
        })) || [],
        disadvantages: state.disadvantages?.map((d) => ({
          id: d.id,
          level: d.level || 0,
        })) || [],
        limitations: state.limitations?.map((l) => ({
          id: l.id,
          level: l.level || 0,
        })) || [],
        expansions: state.expansions?.map((e) => ({
          id: e.id,
          level: e.level || 0,
        })) || [],
        expertises: state.expertises?.map((e) => ({
          id: e.id,
          level: e.level || 0,
        })) || [],
        techniques: state.techniques?.map((t) => ({
          id: t.id,
          level: t.level || 0,
        })) || [],
        magics: state.magics?.map((m) => ({
          id: m.id,
          level: m.level || 0,
        })) || [],
      };

      // 6° Envia para a API
      const response = await createCard(cardData);

      // 7° Verifica a resposta
      if (response && response.error) {
        showAlertWithTimeout(`Erro: ${response.error}`);
      } else {
        showAlertWithTimeout("Ficha salva com sucesso!");
        console.log(response);
        // Limpa o card após salvar
        useCardStore.getState().resetCard();
      }
    } catch (error) {
      console.error("Erro ao salvar ficha:", error);

      if (error.response) {
        showAlertWithTimeout(`Erro do servidor: ${error.response.data?.error || error.message}`);
      } else if (error.message) {
        showAlertWithTimeout(`Erro: ${error.message}`);
      } else {
        showAlertWithTimeout('Erro ao salvar a ficha. Tente novamente.');
      }
    }
  };

  return (
    <>
      <div id="save-popup">
        <div className="save-box">
          <span className="save-label"><FaDownload /></span>

          <div className="save-tooltip">
            <button id="save-btn" onClick={saveCard}>
              Salvar Ficha
            </button>

            <button id="download-btn" onClick={() => console.log("👍")}>
              Baixar Ficha
            </button>
          </div>
        </div>
      </div>

      {showAlert && (
        <div className={`popup-alert-overlay  ${isClosingAlert ? "closing" : ""}`} onClick={closeAlert} >
          <div className={`alert-dialog ${isClosingAlert ? "closing" : ""}`} onClick={(e) => e.stopPropagation()}>
            <p >{alertMessage}</p>
          </div>
        </div>
      )}
    </>
  );
}