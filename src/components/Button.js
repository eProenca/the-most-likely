import React from "react";

const Button = ({ label, onClick, disabled = false }) => {  // 'disabled' com valor padrão false
  return (
    <button
      style={{
        padding: "10px 20px",
        margin: "10px",
        fontSize: "16px",
        cursor: disabled ? "not-allowed" : "pointer",
        backgroundColor: disabled ? "#d6d6d6" : "#007bff",
        color: disabled ? "#a1a1a1" : "#fff",
        border: "none",
        borderRadius: "5px",
        minWidth: "210px",
        maxWidth: "210px"
      }}
      onClick={onClick}
      disabled={disabled}
    >
      {label}
    </button>
  );
};

export default Button;
