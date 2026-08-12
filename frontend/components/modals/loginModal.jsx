import { useState } from "react";
import { loginUser, registerUser } from "../../services/api";
import "../../styles/modals/loginModal.css";
import { BsFeather } from "react-icons/bs";
import { GiClosedDoors } from "react-icons/gi";
import { IoEye, IoEyeOff } from "react-icons/io5";

// Constantes para validação
const allowedDomains = ["gmail.com", "hotmail.com", "outlook.com"];
const minPasswordLength = 6;

// Função para validar o e-mail
function validateEmail(email) {
  const emailLower = email.trim().toLowerCase();

  // Valida formato básico
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(emailLower)) {
    return false;
  }
  const domain = emailLower.split("@")[1];

  return allowedDomains.includes(domain);
}

// Função para validar a senha
function validatePassword(password, confirmPassword) {
  if (password.length < minPasswordLength) {
    return "A senha deve ter pelo menos 6 caracteres.";
  }

  if (!/[a-z]/.test(password)) {
    return "A senha deve conter uma letra minúscula.";
  }

  if (!/[A-Z]/.test(password)) {
    return "A senha deve conter uma letra maiúscula.";
  }

  if (!/\d/.test(password)) {
    return "A senha deve conter um número.";
  }

  if (password !== confirmPassword) {
    return "As senhas devem ser iguais.";
  }
  return;
}

export default function LoginModal({ onClose, onLoginSuccess }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [username, setUsername] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [confirmeRegisterPassword, setConfirmeRegisterPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // true = register | false = login
  const [isRegister, setIsRegister] = useState(false);

  // Variáveis de estado para controlar a visibilidade das senhas
  const [viewPassword, setViewPassword] = useState(false);
  const [viewConfirmPassword, setViewConfirmPassword] = useState(false);

  // Função para lidar com o login
  async function handleLogin(e) {
    e.preventDefault();

    // Validação dos campos
    if (!email || !password) {
      setError("Preencha todos os campos");
      return;
    }

    // Validação do e-mail
    if (!validateEmail(email)) {
      setError("E-mail inválido, ele deve ser do Gmail, Hotmail ou Outlook");
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

      onLoginSuccess();
      onClose?.();
    } finally {
      setLoading(false);
    }
  }

  // Função para lidar com o registro
  async function handleRegister(e) {
    e.preventDefault();

    if (!username || !registerEmail || !registerPassword) {
      setError("Preencha todos os campos");
      return;
    }

    if (!validateEmail(registerEmail)) {
      setError("E-mail inválido, ele deve ser do Gmail, Hotmail ou Outlook");
      return;
    }

    const passwordError = validatePassword(
      registerPassword,
      confirmeRegisterPassword,
    );

    if (passwordError) {
      setError(passwordError);
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

      onLoginSuccess();
      onClose?.();
    } finally {
      setLoading(false);
    }
  }

  // Alternar entre login e registro (limpa erro)
  function toggleAuthMode() {
    setError("");
    setIsRegister((prev) => !prev);
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
              <GiClosedDoors id="login-door" />
              <h2 id="title-login">Login</h2>
            </div>

            <div className="input-group">
              <label id="label-login">E-mail</label>
              <input
                id="input-login-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value.toLowerCase())}
              />
            </div>

            <div className="input-group">
              <label id="label-login">Senha</label>
              <input
                id="input-login-password"
                type="password"
                value={password}
                onChange={(e) => {
                  const value = e.target.value.replace(
                    /[^a-zA-Z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>/?`~]/g,
                    "",
                  );
                  setPassword(value);
                }}
              />
            </div>

            {error && <p className="error-msg">{error}</p>}

            <button type="submit" disabled={loading}>
              {loading ? "Entrando..." : "Entrar"}
            </button>
          </form>
        )}

        {/* REGISTRO */}
        {isRegister && (
          <form onSubmit={handleRegister} className="auth-form">
            <div className="top-login">
              <BsFeather id="login-feather" />
              <h2 id="title-login">Registrar-se</h2>
            </div>

            <div className="input-group">
              <label id="label-login">Nome</label>
              <input
                id="input-register-username"
                type="text"
                value={username}
                onChange={(e) => {
                  const value = e.target.value.replace(
                    /[^a-zA-Z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>/?`~]/g,
                    "",
                  );

                  setUsername(value);
                }}
              />
            </div>

            <div className="input-group">
              <label id="label-login">E-mail</label>
              <input
                id="input-register-email"
                type="email"
                value={registerEmail}
                onChange={(e) => {
                  const value = e.target.value.replace(
                    /[^a-zA-Z0-9@.]/g,
                    "",
                  );
                  setRegisterEmail(value.toLowerCase())
                }}
              />
            </div>

            <div className="input-group">
              <label id="label-login">Senha</label>

              <div className="password-input-wrapper">
                <input
                  id="input-register-password"
                  type={viewPassword ? "text" : "password"}
                  value={registerPassword}
                  onChange={(e) => {
                    const value = e.target.value.replace(
                      /[^a-zA-Z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>/?`~]/g,
                      "",
                    );
                    setRegisterPassword(value);
                  }}
                />

                <button
                  type="button"
                  className="show-password-btn"
                  onClick={() => setViewPassword((prev) => !prev)}
                  title={viewPassword ? "Ocultar senha" : "Mostrar senha"}
                >
                  {viewPassword ? (
                    <IoEye id="view-on" />
                  ) : (
                    <IoEyeOff id="view-off" />
                  )}
                </button>
              </div>
            </div>

            <div className="input-group">
              <label id="label-login">Confirmar senha</label>
              <div className="password-input-wrapper">
                <input
                  id="input-confirm-register-password"
                  type={viewConfirmPassword ? "text" : "password"}
                  value={confirmeRegisterPassword}
                  onChange={(e) => {
                    const value = e.target.value.replace(
                      /[^a-zA-Z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>/?`~]/g,
                      "",
                    );
                    setConfirmeRegisterPassword(value);
                  }}
                />

                <button
                  type="button"
                  className="show-password-btn"
                  onClick={() => setViewConfirmPassword((prev) => !prev)}
                  title={
                    viewConfirmPassword ? "Ocultar senha" : "Mostrar senha"
                  }
                >
                  {viewConfirmPassword ? (
                    <IoEye id="view-on" />
                  ) : (
                    <IoEyeOff id="view-off" />
                  )}
                </button>
              </div>
            </div>

            {error && <p className="error-msg">{error}</p>}

            <button type="submit" disabled={loading}>
              {loading ? "Criando..." : "Criar conta"}
            </button>
          </form>
        )}

        {/* Alternar entre login/registro */}
        <p className="auth-switch">
          {isRegister ? "Já tem conta?" : "Não tem conta?"}
          <button type="button" onClick={toggleAuthMode}>
            {isRegister ? "Entrar" : "Criar conta"}
          </button>
        </p>
      </div>
    </div>
  );
}
