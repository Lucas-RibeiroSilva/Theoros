import { useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import { createGuestSession } from "../services/api";
import { useCardStore } from "../components/stores/cardStore";

export default function SessionManager({ children, handleLogout }) {
  useEffect(() => {
    let timer;

    // Função para limpar tudo (token + dados da ficha)
    function clearAllSessionData() {
      localStorage.removeItem("token");
      localStorage.removeItem("guest_token");
      localStorage.removeItem("card-storage");

      useCardStore.getState().resetCard(); // se você tiver uma action resetCard
    }

    async function initializeSession() {
      try {
        let token = localStorage.getItem("token");

        if (!token) {
          let guestToken = localStorage.getItem("guest_token");
          if (!guestToken) {
            const response = await createGuestSession();
            if (response?.error) {
              console.error("Erro ao criar sessão visitante:", response.error);
              if (handleLogout) handleLogout(true);
              clearAllSessionData();
              return;
            }
            if (response?.guestToken) {
              localStorage.setItem("guest_token", response.guestToken);
              guestToken = response.guestToken;
            }
          }
          token = guestToken;
        }

        if (!token) {
          if (handleLogout) handleLogout(true);
          clearAllSessionData();
          return;
        }

        const decoded = jwtDecode(token);
        const currentTime = Date.now() / 1000;
        const timeLeft = decoded.exp - currentTime;

        if (timeLeft <= 0) {
          // Token expirado
          clearAllSessionData();
          if (localStorage.getItem("token")) {
            handleLogout?.(true);
          } else {
            window.location.reload();
          }
          return;
        }

        // Agenda expiração
        timer = setTimeout(() => {
          clearAllSessionData();
          if (localStorage.getItem("token")) {
            handleLogout?.(true);
          } else {
            handleLogout?.(true);
          }
        }, timeLeft * 1000);
      } catch (error) {
        console.error("Erro ao validar sessão:", error);
        clearAllSessionData();
        handleLogout?.(true);
      }
    }

    initializeSession();

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [handleLogout]);

  return children;
}