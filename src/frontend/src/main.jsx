import React from "react";
import ReactDOM from "react-dom/client";
import ReactUI from "./ReactUI.jsx";
import "./index.css";

const container = document.getElementById("root");
if (!container) throw new Error("Root element #root not found in index.html");

ReactDOM.createRoot(container).render(
  <React.StrictMode>
    <ReactUI />
  </React.StrictMode>
);

//initGame();
