import { Routes, Route, useNavigate } from "react-router-dom";
import { useState } from "react";

import Home from "./pages/home";
import Create from "./pages/create";
import Profile from "./pages/profile";
import CardFull from "./pages/cardFull";
import SearchCards from "./pages/searchCards";
import EditCard from "./pages/edit";
import "./App.css";

import SessionManager from "./components/sessionManager";
import ExpiredModal from "./components/modals/expiredModal";
import GlobalPlayer from "./components/player/globalPlayer";
import { useCardStore } from "./stores/cardStore";

export default function App() {
  const navigate = useNavigate();

  // MODAL GLOBAL
  const [showExpiredModal, setShowExpiredModal] = useState(false);

  //FECHAR MODAL
  const closeExpiredModal = () => {
    setShowExpiredModal(false);

    navigate("/");
  };

  //LOGOUT GLOBAL
  const handleLogout = (autoLogout = false) => {
    useCardStore.getState().resetCard();
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    localStorage.removeItem("guest_token");
    localStorage.removeItem("card-storage");
    localStorage.removeItem("cookieConsent");

    // Logout automático
    if (autoLogout) {
      setShowExpiredModal(true);
      return;
    }

    // Logout manual
    navigate("/");
    setTimeout(() => {
      window.location.reload();
    }, 500);
  };

  return (
    <SessionManager handleLogout={handleLogout}>
      {/* MODAL GLOBAL */}

      {showExpiredModal && <ExpiredModal onClose={closeExpiredModal} />}

      <GlobalPlayer />

      <Routes>
        <Route path="/" element={<Home handleLogout={handleLogout} />} />
        <Route
          path="/create"
          element={<Create handleLogout={handleLogout} />}
        />
        <Route
          path="/edit/:cardId"
          element={<EditCard handleLogout={handleLogout} />}
        />
        <Route
          path="/profile"
          element={<Profile handleLogout={handleLogout} />}
        />
        <Route
          path="/profile/:userId"
          element={<Profile handleLogout={handleLogout} />}
        />
        <Route
          path="/searchCards"
          element={<SearchCards handleLogout={handleLogout} />}
        />
        <Route
          path="/card/:id"
          element={<CardFull handleLogout={handleLogout} />}
        />
      </Routes>
    </SessionManager>
  );
}
