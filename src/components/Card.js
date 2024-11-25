import React, { useState, useEffect } from "react";
import "./Card.css";

const Card = ({ number, question, index, isFlipped, onFlipCard, winner, status, isBlocked }) => {
  const [animateBanner, setAnimateBanner] = useState(false);

  useEffect(() => {
    if (status === 3) {
      setAnimateBanner(true);
    }
  }, [status]);

  const handleFlip = () => {
    onFlipCard(index); // Chama a função para atualizar o estado global
  };

  return (
    <div
      className="card-container"
      onClick={handleFlip} // Apenas vira o card ao clicar
    >
      <div className={`card ${isFlipped ? "flipped" : ""}`}>
        <div className="card-front">
          <h2>{number}</h2>
        </div>
        {/* <div className="card-back"> */}
        <div className={`card-back ${isBlocked ? "blocked" : ""}`}>
          <p>{question}</p>
          {status === 3 && (
            <div className={`winner-banner ${animateBanner ? "slide-in-up" : ""}`}>
              <span>Mais votado: {winner}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Card;
