import React, { useEffect, useState } from "react";
import Header from "./components/Header";
import Button from "./components/Button";
import { db, collection, deleteDoc, doc, onSnapshot, setDoc, getDoc } from "./utils/config/firebase"; 
import { FaTrashCan } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";

const Home = ({ onRegisterParticipant }) => {
  const [participants, setParticipants] = useState([]);
  const navigate = useNavigate(); // Para redirecionar para a tela do jogo
  const [errorMessage, setErrorMessage] = useState("");

  // Monitorar participantes
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "participants"), (snapshot) => {
      const fetchedParticipants = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setParticipants(fetchedParticipants);
    });

    return () => unsubscribe();
  }, []);

  const handleRemoveParticipant = async (id) => {
    try {
      const participantDoc = doc(db, "participants", id);
      await deleteDoc(participantDoc);
      // localStorage.removeItem("participantId");
      setErrorMessage("");
      console.log("Participante removido com sucesso!");
    } catch (error) {
      console.error("Erro ao remover participante:", error);
    }
  };

  const handleStartGame = async () => {
    try {
      const gameStateDocRef = doc(db, "gameState", "current");

      const docSnap = await getDoc(gameStateDocRef);

      if (!docSnap.exists()) {
        await setDoc(gameStateDocRef, { isStarted: true, participants: [] });
        console.log("Jogo iniciado e estado criado!");
      } else {
        await setDoc(gameStateDocRef, { isStarted: true }, { merge: true });
        console.log("Estado do jogo atualizado para 'iniciado'.");
      }

      navigate("/game"); // Redireciona para o jogo

    } catch (error) {
      console.error("Erro ao iniciar o jogo:", error);
    }
  };

  const handleRegisterClick = () => {
      navigate("/register");
  };

  return (
    <div style={{ display: "flex", justifyContent: "center" }}>
      <div
        style={{
          textAlign: "center",
          marginTop: "50px",
          width: "520px",
          border: "1px",
          borderStyle: "solid",
          borderRadius: "8px",
          borderColor: "#888",
          backgroundColor: "#f9f9f9",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        {errorMessage && (
          <p style={{ color: "red", fontWeight: "bold" }}>
            {errorMessage}
          </p>
        )}
        
        <Header title="Quem é o mais provável" />

        <Button label="Iniciar jogo" onClick={handleStartGame} />
        <Button label="Cadastrar participante" onClick={handleRegisterClick} /> 

        {participants.length > 0 && (
          <div style={{ marginTop: "20px" }}>
            <h3>Participantes:</h3>
            <ul style={{ display: "flex", flexWrap: "wrap", listStyleType: "none", padding: 0 }}>
              {participants.map((participant) => (
                <li key={participant.id} style={{ padding: "10px", marginBottom: "10px" }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      textAlign: "center",
                      padding: "8px 15px",
                      backgroundColor: participant.color,
                      color: "#fff",
                      fontWeight: "bold",
                      borderRadius: "8px",
                      boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.2)",
                      textTransform: "capitalize",
                      width: "120px",
                    }}
                  >
                    <span style={{ flexGrow: 1 }}>{participant.name}</span>
                    <button
                      onClick={() => handleRemoveParticipant(participant.id)}
                      style={{
                        backgroundColor: "transparent",
                        border: "none",
                        cursor: "pointer",
                        color: "#fff",
                        fontWeight: "bold",
                        padding: "0",
                        // display: participantId === participant.id ? "flex" : "none",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <FaTrashCan size={12} />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
