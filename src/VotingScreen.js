import React, { useEffect, useState } from "react";
import {
  db,
  doc,
  onSnapshot,
  collection,
  updateDoc,
  getDoc,
  getDocs,
  writeBatch
} from "./utils/config/firebase";
import "./components/VotingScreen.css";

const VotingScreen = () => {
  const [participants, setParticipants] = useState([]);
  const [votedCount, setVotedCount] = useState(0);
  const [selectedParticipant, setSelectedParticipant] = useState(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [question, setQuestion] = useState(null);
  const [currentQuestionId, setCurrentQuestionId] = useState(null);
  const [isVotingClosed, setIsVotingClosed] = useState(false);

  const title = question !== null ? question : "Por favor, aguarde!";

  // Carrega a pergunta atual e monitora os votos dela
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "questions"), (snapshot) => {
      const questionInVoting = snapshot.docs.find(
        (doc) => doc.data().status === 2
      );

      if (questionInVoting) {
        const questionData = questionInVoting.data();
        setQuestion(questionData.question);
        setCurrentQuestionId(questionInVoting.id);

        // Atualiza a contagem de votos da pergunta
        setVotedCount(questionData.votes || 0);

        // Verifica se a votação está encerrada
        if (
          questionData.votes >= participants.length &&
          participants.length > 0
        ) {
          setIsVotingClosed(true);

          // Busca o participante com mais votos
          const fetchWinner = async () => {
            const participantsSnapshot = await getDocs(collection(db, "participants"));
            const participantsData = participantsSnapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }));

            const winner = participantsData.reduce((prev, current) =>
              (current.votes || 0) > (prev.votes || 0) ? current : prev
            );

            // Atualiza o campo 'winner' na pergunta
            const questionsDocRef = doc(db, "questions", questionInVoting.id);
            await updateDoc(questionsDocRef, {
              status: 3, // Encerrada
              winner: winner.name || "Sem vencedor", // Nome do vencedor ou fallback
            });
          };

          fetchWinner().catch((error) => {
            console.error("Erro ao buscar o vencedor:", error);
          });
        } else {
          setIsVotingClosed(false);
        }
      } else {
        setQuestion("Por favor, aguarde!");
        setCurrentQuestionId(null);
        setVotedCount(0);
        // setIsVotingClosed(false);
      }
    });

    return () => unsubscribe();
  }, [participants]);

  // Carrega os participantes
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "participants"), (snapshot) => {
      const fetchedParticipants = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setParticipants(fetchedParticipants);
    });

    return () => unsubscribe();
  }, []);

  // Registra o voto
  const handleVote = async () => {
    if (selectedParticipant && currentQuestionId) {
      setHasVoted(true);

      // Atualiza o voto do participante no Firestore
      const participantDocRef = doc(db, "participants", selectedParticipant);
      const selected = participants.find((p) => p.id === selectedParticipant);

      await updateDoc(participantDocRef, {
        hasVoted: true,
        votes: (selected?.votes || 0) + 1,
      });

      // Incrementa o total de votos da pergunta no Firestore
      const questionDocRef = doc(db, "questions", currentQuestionId);
      const questionSnap = await getDoc(questionDocRef);
      const currentVotes = questionSnap.data()?.votes || 0;

      await updateDoc(questionDocRef, {
        votes: currentVotes + 1,
      });

      setSelectedParticipant(null);
    } else {
      alert("Por favor, selecione um participante antes de votar.");
    }
  };

  // Zera os votos dos participantes ao iniciar uma nova pergunta
  useEffect(() => {
    if (currentQuestionId) {
      setHasVoted(false);
      participants.forEach(async (participant) => {
        const participantDocRef = doc(db, "participants", participant.id);
        await updateDoc(participantDocRef, {
          votes: 0,
          hasVoted: false,
        });
      });
    }
  }, [currentQuestionId]);

  return (
    <div className="voting-screen">
      {/* Sidebar com informações */}
      <div className="sidebar">
        <h3>Votação</h3>
        <p>Participantes: {participants.length}</p>
        <p>Participantes que já votaram: {votedCount}</p>
      </div>

      {/* Área principal */}
      <div className="main-content">
        <h2>{title}</h2>

        <div
          className="participants-list"
          style={{
            display: "flex",
            flexWrap: "wrap",
            listStyleType: "none",
            padding: 0,
            gap: "10px",
          }}
        >
          {participants.map((participant) => (
            <label
              key={participant.id}
              style={{
                backgroundColor: participant.color,
                color: "#fff",
                fontWeight: "bold",
                borderRadius: "8px",
                boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.2)",
                textTransform: "capitalize",
                width: "120px",
              }}
            >
              <input
                type="radio"
                name="participant"
                value={participant.name}
                checked={selectedParticipant === participant.id}
                onChange={() => setSelectedParticipant(participant.id)}
                disabled={hasVoted || isVotingClosed}
              />
              <span style={{ marginLeft: "8px", fontWeight: "bold" }}>
                {participant.name}
              </span>
            </label>
          ))}
        </div>

        <button
          onClick={handleVote}
          disabled={!selectedParticipant || hasVoted || isVotingClosed}
        >
          Votar
        </button>
      </div>

      {/* Modal de votação encerrada */}
      {isVotingClosed && (
        <div className="modal">
          <div className="modal-content">
            <h2>Votação encerrada!</h2>
            <p>Todos os participantes votaram. Aguardando a próxima pergunta!</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default VotingScreen;
