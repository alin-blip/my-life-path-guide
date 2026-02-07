import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { GlobalErrorCapture } from "./components/GlobalErrorCapture.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <GlobalErrorCapture />
    <App />
  </StrictMode>,
);
