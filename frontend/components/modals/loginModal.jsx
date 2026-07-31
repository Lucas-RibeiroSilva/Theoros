import { useState } from "react";
import { loginUser, registerUser } from "../../services/api";
import "../../styles/modals/loginModal.css";
import { BsFeather } from "react-icons/bs";
import { GiClosedDoors } from "react-icons/gi";


export default function LoginModal({ onClose }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [username, setUsername] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // true = register | false = login
  const [isRegister, setIsRegister] = useState(false);

  async function handleLogin(e) {
    e.preventDefault();

    if (!email || !password) {
      setError("Preencha todos os campos");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const data = await loginUser(email, password);

      if (data.error) {
        setError(data.error);
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("username", data.username);

      onClose?.();
    } finally {
      setLoading(false);
    }
  }

  async function handleRegister(e) {
    e.preventDefault();

    if (!username || !registerEmail || !registerPassword) {
      setError("Preencha todos os campos");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const data = await registerUser(
        username,
        registerEmail,
        registerPassword,
      );

      if (data.error) {
        setError(data.error);
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("username", data.username);

      onClose?.();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="modal-login-overlay" onClick={onClose}>
      <div className="modal-login-card" onClick={(e) => e.stopPropagation()}>
        <button className="login-close-btn" onClick={onClose}>
          ✕
        </button>

        {/* LOGIN */}
        {!isRegister && (
          <form onSubmit={handleLogin} className="auth-form">
            <div className="top-login">
              <GiClosedDoors id="login-door"/>
              <h2 id="title-login">Login</h2>
            </div>
            <div className="input-group">
              <label id="label-login">E-mail</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="input-group">
              <label id="label-login">Senha</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {error && <p className="error-msg">{error}</p>}

            <button type="submit" disabled={loading}>
              {loading ? "Entrando..." : "Entrar"}
            </button>
          </form>
        )}

        {/*  REGISTER  */}
        {isRegister && (
          <form onSubmit={handleRegister} className="auth-form">
            <div className="top-login">
              <BsFeather id="login-feather"/>
              <h2 id="title-login">Registrar-se</h2>
            </div>
            <div className="input-group">
              <label id="label-login">Nome</label>
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>

            <div className="input-group">
              <label id="label-login">E-mail</label>
              <input
                type="email"
                value={registerEmail}
                onChange={(e) => setRegisterEmail(e.target.value)}
              />
            </div>

            <div className="input-group">
              <label id="label-login">Senha</label>
              <input
                type="password"
                value={registerPassword}
                onChange={(e) => setRegisterPassword(e.target.value)}
              />
            </div>

            {error && <p className="error-msg">{error}</p>}

            <button type="submit" disabled={loading}>
              {loading ? "Criando..." : "Criar conta"}
            </button>
          </form>
        )}

        {/* SWITCH REAL (TOGGLE) */}
        <p className="auth-switch">
          {isRegister ? "Já tem conta?" : "Não tem conta?"}

          <button
            type="button"
            onClick={() => {
              setError("");
              setIsRegister(!isRegister);
            }}
          >
            {isRegister ? "Entrar" : "Criar conta"}
          </button>
        </p>
      </div>
    </div>
  );
}
