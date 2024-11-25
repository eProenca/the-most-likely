import React, { useState } from "react";
import { Routes, Route } from "react-router-dom";
import Home from "./Home";
import ParticipantForm from "./ParticipantForm";
import GameScreen from "./GameScreen";
import VotingScreen from "./VotingScreen";

const App = () => {
  const [participants, setParticipants] = useState([]);
  const [usedColors, setUsedColors] = useState([]);

  const addParticipant = (name, color) => {
    setParticipants([...participants, { name, color }]);
    setUsedColors([...usedColors, color]); // Marca a cor como usada
  };

  return (
    <Routes>
      <Route
        path="/"
        element={<Home participants={participants} onRegisterParticipant={addParticipant} />}
      />
      <Route
        path="/register"
        element={<ParticipantForm onRegisterParticipant={addParticipant} usedColors={usedColors} />}
      />
      <Route
        path="/game"
        element={<GameScreen participants={participants} />}
      />
      <Route
        path="/voting"
        element={<VotingScreen participants={participants} />}
      />
    </Routes>
  );
};

export default App;
