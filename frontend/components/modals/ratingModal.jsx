import { useState, useEffect } from "react";
import "../../styles/modals/ratingModal.css"

import { rateCard } from "../../services/api";

export default function RatingModal({ onClose, cardId }) {
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState("");
    const [hoverRating, setHoverRating] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);

    function showStars() {
        const starsArray = [];
        const totalStars = 5;

        // Usa a avaliação de hover se existir, senão usa a avaliação atual
        const currentRating = hoverRating || rating;

        for (let i = 1; i <= totalStars; i++) {
            if (i <= currentRating) {
                // Estrela cheia
                starsArray.push(
                    <img
                        key={i}
                        src="/stars/full_star.webp"
                        id="star-icon-full"
                        onMouseEnter={() => handleMouseEnter(i)}
                        onMouseLeave={handleMouseLeave}
                        onClick={() => handleClick(i)}
                    />
                );
            } else {
                // Estrela vazia
                starsArray.push(
                    <img
                        key={i}
                        src="/stars/null_star.webp"
                        id="star-rating-empty"
                        onMouseEnter={() => handleMouseEnter(i)}
                        onMouseLeave={handleMouseLeave}
                        onClick={() => handleClick(i)}
                    />
                );
            }
        }

        return starsArray;
    }

    // Handlers para interação com as estrelas
    function handleMouseEnter(index) {
        setHoverRating(index);
    }

    function handleMouseLeave() {
        setHoverRating(0);
    }

    function handleClick(index) {
        setRating(index);
        setHoverRating(0); // Reseta o hover após clicar
    }

    // Função para enviar avaliação para a API
    async function submitRating() {
        if (rating === 0) {
            alert("Por favor, selecione uma avaliação antes de enviar.");
            return;
        }

        setIsSubmitting(true);

        try {
            await rateCard(cardId, rating, comment)

            onClose();

        } catch (error) {
            console.error('Erro ao enviar avaliação:', error);
            alert('Erro ao enviar avaliação. Tente novamente.');
        } finally {
            setIsSubmitting(false);
        }
    }

    // Função para resetar a avaliação
    function resetRating() {
        setRating(0);
        setComment("");
        setHoverRating(0);
    }

    return (
        <div className="modal-rating-overlay" onClick={onClose}>
            <div className="rating-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-rating-header">
                    <h2 id="title-modal-rating">Avaliar Ficha</h2>
                    <button id="rating-close-btn" onClick={onClose}>✕</button>
                </div>

                <div className="stars-rating-modal">
                    {showStars()}
                </div>

                <div className="rating-comment">
                    <p>Comentário:</p>
                    <textarea name="comment" id="textarea-rating-commnet" value={comment}
                        onChange={(e) => setComment(e.target.value)} maxLength="200"></textarea>
                </div>

                <div className="rating-actions">
                    <button
                        className="btn-reset-rating"
                        onClick={resetRating}
                        disabled={rating === 0 || isSubmitting}
                    >
                        Limpar
                    </button>
                    <button
                        className="btn-submit-rating"
                        onClick={submitRating}
                        disabled={rating === 0 || isSubmitting}
                    >
                        {isSubmitting ? 'Enviando...' : 'Enviar Avaliação'}
                    </button>
                </div>
            </div>
        </div>
    );
}