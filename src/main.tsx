import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import AppWithTheme from "@src/components/AppWithTheme";
import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AppWithTheme />
  </StrictMode>,
);
