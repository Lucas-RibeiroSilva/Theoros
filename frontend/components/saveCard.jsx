import { useState, useEffect, useRef } from "react";
import "../styles/components/saveCard.css";
import { useCardStore } from "../stores/cardStore";
import { updateCard, createCard } from "../services/api";
import { MdFileDownload } from "react-icons/md";
import { IoIosSave } from "react-icons/io";
import { useDownloadPDF } from "../services/pdfGenerator";

export default function SaveCard({ onOpenLoginModal, cardId, isEdit }) {
  const [showAlert, setShowAlert] = useState(false);
  const [isClosingAlert, setIsClosingAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const timeoutRef = useRef(null);
  const state = useCardStore();
  const [editable, setEditable] = useState(isEdit);
  const [isSaving, setIsSaving] = useState(false);
  const { handleDownload } = useDownloadPDF();

  // Limpa o timeout ao desmontar
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, []);

  // Função para exibir o alerta
  const showAlertWithTimeout = (message, duration = 3000) => { // Mudado para 3 segundos
    // Cancela timeout pendente
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    setAlertMessage(message);
    setIsClosingAlert(false);
    setShowAlert(true);

    // Fecha automaticamente
    timeoutRef.current = setTimeout(() => {
      closeAlert();
    }, duration);
  };

  // Fecha o alerta
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
    setIsSaving(true);

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        if (onOpenLoginModal) {
          onOpenLoginModal();
        }
        setIsSaving(false);
        return;
      }

      if (!state.name) {
        showAlertWithTimeout("O nome da ficha é obrigatório !!");
        setIsSaving(false);
        return;
      }

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

      let response;

      if (editable === true) {
        response = await updateCard(cardId, cardData);
        setEditable(false);
      } else {
        response = await createCard(cardData);
      }

      if (response && response.error) {
        showAlertWithTimeout(`Erro: ${response.error}`);
      } else {
        showAlertWithTimeout("Ficha salva com sucesso!");
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
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <div id="save-popup">
        <div className="save-box">
          <button className="save-button" onClick={saveCard} disabled={isSaving}>
            <IoIosSave id="icon-save-card" />
          </button>
        </div>

        <div className="download-box">
          <button onClick={handleDownload} className="download-button">
            <MdFileDownload id="icon-download-card" />
          </button>
        </div>
      </div>

      {/* Popup de alerta - SEMPRE RENDERIZADO, mas controlado por CSS */}
      <div 
        className={`popup-alert-overlay ${showAlert ? '' : 'closing'} ${isClosingAlert ? 'closing' : ''}`}
        onClick={closeAlert}
        style={{ display: showAlert || isClosingAlert ? 'flex' : 'none' }}
      >
        <div 
          className={`alert-dialog ${isClosingAlert ? 'closing' : ''}`}
          onClick={(e) => e.stopPropagation()}
        >
          <p>{alertMessage}</p>
        </div>
      </div>
    </>
  );
}