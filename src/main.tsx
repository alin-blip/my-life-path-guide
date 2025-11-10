import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { MigrationProvider } from './context/MigrationContext';

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <MigrationProvider>
      <App />
    </MigrationProvider>
  </StrictMode>,
);
