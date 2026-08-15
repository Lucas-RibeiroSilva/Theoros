// RatingModal.jsx
import { useState } from "react";
import "../../styles/modals/ratingModal.css";
import { rateCard } from "../../services/api";

export default function RatingModal({ onClose, cardId, onRatingSubmit }) {
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState("");
    const [hoverRating, setHoverRating] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);

    function showStars() {
        const starsArray = [];
        const totalStars = 5;
        const currentRating = hoverRating || rating;

        for (let i = 1; i <= totalStars; i++) {
            if (i <= currentRating) {
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

    function handleMouseEnter(index) {
        setHoverRating(index);
    }

    function handleMouseLeave() {
        setHoverRating(0);
    }

    function handleClick(index) {
        setRating(index);
        setHoverRating(0);
    }

    async function submitRating() {
        if (rating === 0) {
            return;
        }

        setIsSubmitting(true);

        try {
            await rateCard(cardId, rating, comment);
            
            // Chama o callback para atualizar os dados no componente pai
            if (onRatingSubmit) {
                await onRatingSubmit();
            }
            
            // Fecha o modal
            onClose();
            
            // NÃO use window.location.reload()
            
        } catch (error) {
            console.error('Erro ao enviar avaliação:', error);
        } finally {
            setIsSubmitting(false);
        }
    }

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
                    <textarea 
                        name="comment" 
                        id="textarea-rating-commnet" 
                        value={comment}
                        onChange={(e) => setComment(e.target.value)} 
                        maxLength="200"
                    />
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