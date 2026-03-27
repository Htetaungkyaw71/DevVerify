import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import App from "./App.tsx";
import "./index.css";
import { persistor, store } from "./store";
import AppErrorBoundary from "@/components/AppErrorBoundary";

const persistedTheme = localStorage.getItem("theme");
if (persistedTheme === "light") {
  document.documentElement.classList.remove("dark");
} else {
  document.documentElement.classList.add("dark");
}

createRoot(document.getElementById("root")!).render(
  <Provider store={store}>
    <AppErrorBoundary>
      <PersistGate loading={null} persistor={persistor}>
        <App />
      </PersistGate>
    </AppErrorBoundary>
  </Provider>,
);
