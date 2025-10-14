import React from "react";
import axios from "axios";

export default function LogoutButton({ setUser }) {
  const localhost = '91.229.9.244';
  const handleLogout = async () => {
    try {
      await axios.post(`http://${localhost}:5000/auth/logout`, {}, { withCredentials: true });
    } catch (err) {
      console.error("Ошибка при выходе:", err);
    }
    localStorage.removeItem("user");
    setUser(null);
    window.location.href = "/";
  };

  return (
    <button
      onClick={handleLogout}
      style={{
        padding: "10px 20px",
        backgroundColor: "#ff4d4d",
        color: "white",
        border: "none",
        borderRadius: "8px",
        cursor: "pointer",
        fontSize: "16px",
        fontWeight: "bold",
        position: "absolute",
        top: 30,
        right: 20
      }}
    >
      Выйти
    </button>
  );
}
