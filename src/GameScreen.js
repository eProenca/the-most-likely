import React, { useEffect, useState } from "react";
import {
  db,
  collection,
  getDocs,
  doc,
  updateDoc,
  onSnapshot,
  writeBatch,
  getDoc
} from "./utils/config/firebase";
import { useNavigate } from "react-router-dom";
import Card from "./components/Card";
import initializeQuestions from "./services/QuestionService"; // Importe a função

const GameScreen = () => {
  const [participants, setParticipants] = useState([]);
  const [gameCards, setGameCards] = useState([]);
  const navigate = useNavigate();
  const [currentQuestionId, setCurrentQuestionId] = useState(null);

  // Carregar perguntas do Firestore
  const fetchQuestions = async () => {
    try {
      const questionsRef = collection(db, "questions");
      const querySnapshot = await getDocs(questionsRef);
      const fetchedQuestions = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      
      // Embaralhar as perguntas para exibir de forma aleatória
      const shuffledQuestions = fetchedQuestions.sort((a, b) => a.number - b.number);
      
      // Armazenar as perguntas no estado gameCards
      setGameCards(shuffledQuestions);
      
    } catch (error) {
      console.error("Erro ao carregar perguntas: ", error);
    }
  };

  // Carregar os participantes do Firestore
  useEffect(() => {
    const fetchParticipants = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "participants"));
        const fetchedParticipants = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setParticipants(fetchedParticipants);
      } catch (error) {
        console.error("Erro ao carregar participantes: ", error);
      }
    };
    fetchParticipants();
  }, []);

  // Inicializar perguntas na montagem do componente (e sempre que a tela for acionada)
  useEffect(() => {
    const initializeFirestoreQuestions = async () => {
      await initializeQuestions(); // Chama a função que inicializa a coleção de perguntas
      fetchQuestions(); // Carrega as perguntas após a inicialização
    };
    
    initializeFirestoreQuestions();
  }, []); // A dependência vazia garante que isso só aconteça uma vez, quando a tela for acionada

  // Monitorar o estado do jogo (se foi encerrado)
  useEffect(() => {
    const gameStateDocRef = doc(db, "gameState", "current");

    const unsubscribe = onSnapshot(gameStateDocRef, (snapshot) => {
      const gameState = snapshot.data();
      if (gameState && !gameState.isStarted) {
        console.log("Jogo encerrado. Redirecionando para a Home...");
        navigate("/", { replace: true });
      }
    });

    return () => unsubscribe();
  }, [navigate]);


  const handleRanking = () => {
    // Cria uma cópia dos participantes para evitar mutação direta
    const updatedParticipants = [...participants];
  
    // Itera pelos cards com status 3
    gameCards.forEach((card) => {
      if (card.status === 3 && card.winner) {
        // Encontra o participante vencedor e incrementa o ponto
        const winnerIndex = updatedParticipants.findIndex(
          (participant) => participant.name === card.winner
        );
        if (winnerIndex !== -1) {
          updatedParticipants[winnerIndex].points += 1;
        }
      }
    });
  
    // Ordena os participantes por pontos, do maior para o menor
    updatedParticipants.sort((a, b) => b.points - a.points);
  
    // Atualiza o estado dos participantes
    setParticipants(updatedParticipants);
  
    // Atualiza os pontos no Firestore
    const batch = writeBatch(db);
    updatedParticipants.forEach((participant) => {
      const participantDocRef = doc(db, "participants", participant.id);
      batch.update(participantDocRef, { points: participant.points });
    });
  
    batch
      .commit()
      .then(() => console.log("Ranking atualizado no Firestore!"))
      .catch((error) => console.error("Erro ao atualizar ranking:", error));
  };

  // Encerrar o jogo
  const handleEndGame = async () => {
    try {
      const gameStateDocRef = doc(db, "gameState", "current");
      await updateDoc(gameStateDocRef, { isStarted: false });

      const gameStateDoc = await getDoc(gameStateDocRef);
      const updatedState = gameStateDoc.data();

      if (updatedState && updatedState.isStarted === false) {
        console.log("Jogo encerrado com sucesso!");

        // Zerar os pontos dos participantes localmente
        const resetParticipants = participants.map((participant) => ({
          ...participant,
          points: 0,
        }));
        setParticipants(resetParticipants);

        // Atualizar os pontos dos participantes no Firestore
        const batch = writeBatch(db);
        resetParticipants.forEach((participant) => {
          const participantDocRef = doc(db, "participants", participant.id);
          batch.update(participantDocRef, { points: 0 });
        });
        await batch.commit();

        console.log("Contadores dos participantes zerados com sucesso.");
      } else {
        console.error("Falha ao encerrar o jogo.");
      }
    } catch (error) {
      console.error("Erro ao encerrar o jogo:", error);
    }
  };

   // Lógica para monitorar e atualizar status e vencedor
   useEffect(() => {
    const monitorQuestion = async () => {
      if (!currentQuestionId) {
        console.log("Esperando o ID da pergunta atual...");
        return;
      }

      const questionDocRef = doc(db, "questions", currentQuestionId);
      try {
        const questionSnapshot = await getDoc(questionDocRef);
        if (questionSnapshot.exists()) {
          const questionData = questionSnapshot.data();
          console.log("Dados da pergunta:", questionData);

          // Atualiza o estado e vencedor no gameCards
          setGameCards((prevCards) =>
            prevCards.map((card) =>
              card.id === currentQuestionId
                ? {
                    ...card,
                    status: questionData.status || card.status,
                    winner: questionData.winner || card.winner,
                    isBlocked: questionData.status === 3 ? true : card.isBlocked
                  }
                : card
            )
          );
        } else {
          console.warn(`Pergunta com ID ${currentQuestionId} não encontrada.`);
        }
      } catch (error) {
        console.error("Erro ao monitorar pergunta:", error);
      }
    };

    const intervalId = setInterval(monitorQuestion, 3000); // Executa a cada 3 segundos

    return () => clearInterval(intervalId); // Limpa o intervalo ao desmontar
  }, [currentQuestionId]);

  // Atualizar o estado do card virado
  const handleFlipCard = async (index) => {
    const updatedCards = [...gameCards];

    if (updatedCards[index].isBlocked) {
      return
    }
    
    updatedCards[index].isFlipped = !updatedCards[index].isFlipped;
    setGameCards(updatedCards);

    // Atualiza a pergunta no Firestore quando o card for virado
    if (updatedCards[index].isFlipped) {
      // const question = updatedCards[index].question;

      // const gameStateDocRef = doc(db, "gameState", "current");
      // await updateDoc(gameStateDocRef, { question: question });

      setCurrentQuestionId(updatedCards[index].id);
      const questionsDocRef = doc(db, "questions", updatedCards[index].id);
      await updateDoc(questionsDocRef, { status: 2}) //Em votação
    }
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        marginTop: "50px",
        padding: "20px",
      }}
    >
      <button
        onClick={handleRanking} // Função que será chamada ao clicar no botão
        style={{
          position: "absolute",
          top: "20px",
          right: "120px", // Ajusta a posição para não sobrepor o botão "Encerrar"
          backgroundColor: "#4CAF50", // Cor verde para diferenciar
          color: "#fff",
          border: "none",
          padding: "10px 20px",
          fontSize: "16px",
          borderRadius: "5px",
          cursor: "pointer",
          marginRight: "15px"
        }}
      >
        Ranking
      </button>

      <button
        onClick={handleEndGame}
        style={{
          position: "absolute",
          top: "20px",
          right: "20px",
          backgroundColor: "#ff4d4d",
          color: "#fff",
          border: "none",
          padding: "10px 20px",
          fontSize: "16px",
          borderRadius: "5px",
          cursor: "pointer",
        }}
      >
        Encerrar
      </button>

      <div
        style={{ width: "200px", marginRight: "20px", textAlign: "center" }}
      >
        <h3>Participantes</h3>
        <ul style={{ listStyleType: "none", padding: 0 }}>
          {participants.map((participant) => (
            <li
              key={participant.id}
              style={{
                padding: "8px 15px",
                marginBottom: "10px",
                backgroundColor: participant.color,
                color: "#fff",
                fontWeight: "bold",
                borderRadius: "25px",
                boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.2)",
                textTransform: "capitalize",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <span>{participant.name}</span>
              <div
                style={{
                  width: "25px",
                  height: "25px",
                  borderRadius: "50%",
                  backgroundColor: "#fff",
                  color: participant.color,
                  textAlign: "center",
                  lineHeight: "20px",
                  marginLeft: "10px",
                  fontWeight: "bold",
                  border: `2px solid ${participant.color}`,
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <span>{participant.points}</span>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div
        style={{
          flexGrow: 1,
          textAlign: "center",
          padding: "20px",
          backgroundColor: "#f4f4f4",
          borderRadius: "8px",
          boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)",
        }}
      >
        <h3>Perguntas do Jogo</h3>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
          }}
        >
          {gameCards.map((card, index) => (
            <Card
              key={index}
              number={card.number}
              question={card.question}
              index={index}
              isFlipped={card.isFlipped}
              isBlocked={card.isBlocked}
              onFlipCard={handleFlipCard}
              status={card.status} // Passa o status da pergunta
              winner={card.winner} // Passa o nome do vencedor
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default GameScreen;
