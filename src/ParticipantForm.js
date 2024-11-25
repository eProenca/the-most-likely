import React, { useState, useEffect } from "react";
import Header from "./components/Header";
import { db } from './utils/config/firebase';
import { collection, onSnapshot, addDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

const colors = [
  "#CA0F13", "#122CD7", "#107F2F", "#ff80ed", "#ffa500", "#F7F726",
  "#1C1C25", "#6B30BA", "#71481D", "#33FFDB", "#4AF432", "#938877",
  "#ff4040", "#ffc0cb", "#999999", "#daa520",
];

const ParticipantForm = ({ onRegisterParticipant }) => {
  const [name, setName] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [usedColors, setUsedColors] = useState([]);
  const navigate = useNavigate()

  // Escuta mudanças em tempo real na coleção "participants"
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "participants"), (snapshot) => {
      const updatedUsedColors = snapshot.docs.map(doc => doc.data().color);
      setUsedColors(updatedUsedColors);
    });

    return () => unsubscribe(); // Limpa a escuta ao desmontar o componente
  }, []);

  const addParticipantToFirestore = async (name, color) => {
    try {
      const participantsCollection = collection(db, "participants");

      const docRef = await addDoc(participantsCollection, {
        name,
        color,
        points: 0, // Inicializa os pontos como 0
      });
      localStorage.setItem("participantId", docRef.id);

      console.log("Participante salvo com sucesso!");
    } catch (error) {
      console.error("Erro ao salvar participante no Firestore:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name || !selectedColor) {
      alert("Preencha todos os campos!");
      return;
    }
    if (usedColors.includes(selectedColor)) {
      alert("Esta cor já foi escolhida, selecione outra cor!");
      return;
    }

    try {
      await addParticipantToFirestore(name, selectedColor);
      setName("");
      setSelectedColor("");
      navigate("/voting");
    } catch (error) {
      console.error("Erro ao salvar participante:", error);
    }
  };

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <Header title="Cadastrar Participante" />
      <form
        onSubmit={handleSubmit}
        style={{
          display: "inline-block",
          textAlign: "left",
          padding: "20px",
          border: "1px solid #ccc",
          borderRadius: "8px",
          backgroundColor: "#f9f9f9",
        }}
      >
        <div style={{ marginBottom: "15px" }}>
          <label style={{ display: "block", marginBottom: "5px" }}>Nome:</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Digite o nome"
            style={{ padding: "10px", width: "96%" }}
          />
        </div>
        <div style={{ marginBottom: "15px" }}>
          <label style={{ display: "block", marginBottom: "5px" }}>Selecione a cor:</label>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "10px",
              width: "310px",
              justifyContent: "center",
            }}
          >
            {colors.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => setSelectedColor(color)}
                disabled={usedColors.includes(color)}
                style={{
                  width: "30px",
                  height: "30px",
                  borderRadius: "50%",
                  backgroundColor: color,
                  border: selectedColor === color ? "3px solid #000" : "2px solid #ccc",
                  cursor: usedColors.includes(color) ? "not-allowed" : "pointer",
                  opacity: usedColors.includes(color) ? 0.2 : 1,
                }}
              ></button>
            ))}
          </div>
        </div>
        <div style={{ textAlign: "center" }}>
          <button
            type="submit"
            style={{
              padding: "10px 20px",
              marginRight: "10px",
              backgroundColor: "#28a745",
              color: "#fff",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
            }}
          >
            Cadastrar
          </button>
          <button
            type="button"
            onClick={() => navigate("/")}
            style={{
              padding: "10px 20px",
              backgroundColor: "#dc3545",
              color: "#fff",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
            }}
          >
            Voltar
          </button>
        </div>
      </form>
    </div>
  );
};

export default ParticipantForm;
