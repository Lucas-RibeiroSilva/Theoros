import "../../styles/modals/expiredModal.css";

export default function ExpiredModal({ onClose }) {
  return (
    <div className="modal-expired-overlay" onClick={onClose}>
      <div className="modal-expired" onClick={(e) => e.stopPropagation()}>
        <h2>⚠️ Sessão encerrada</h2>

        <p>Devido ao tempo de inatividade você foi deslogado automaticamente❗</p>

        <button onClick={onClose} className="expired-btn-close">
          Fechar
        </button>
      </div>
    </div>
  );
}