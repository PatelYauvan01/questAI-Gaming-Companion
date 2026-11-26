import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { GuideOverlay } from "./components/overlay/GuideOverlay";
import "./index.css";
import "./styles/overlay.css";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    {new URLSearchParams(window.location.search).has("overlay") ? (
      <GuideOverlay />
    ) : (
      <BrowserRouter>
        <App />
      </BrowserRouter>
    )}
  </React.StrictMode>,
);
