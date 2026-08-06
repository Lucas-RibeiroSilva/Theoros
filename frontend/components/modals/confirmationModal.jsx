import React from "react";

export default function ConfirmationModal({ onClose }) {

 return (
        <div className="modal-confirmation-overlay" onClick={onClose}>
            <div className="confirmation-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-confirmation-header">
                    <h2 id="title-modal-confirmation">Deseja excluir a ficha?</h2>
                    <button id="confirmation-close-btn" onClick={onClose}>✕</button>
                </div>

                <div className="confirmation-message-modal">
                    <p>Exclusão permanente e irreversível de toda a ficha e dados associados.</p>
                </div>

                <div className="confirmation-actions">
                    <button className="btn-confirmation" onClick={submitRating}>
                        Confirmar
                    </button>
                </div>
            </div>
        </div>
    );
}