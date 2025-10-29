// src/components/TopBar.js
import React from "react";
import "./TopBar.css";

export default function TopBar({ username = "Aspirant", onSignOut }) {
  return (
    <header className="topbar">
      <div className="topbar-left">
        <div className="topbar-symbol">📘</div>
        <span className="topbar-title">TANCET <strong>Prep</strong></span>
      </div>

      <div className="topbar-right">
        <span className="topbar-welcome">Welcome, {username}!</span>
        <button className="signout-btn" onClick={onSignOut}>
          Sign Out
        </button>
      </div>
    </header>
  );
}
